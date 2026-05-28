import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { RedisService } from '../cache/redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import {
  BCRYPT_SALT_ROUNDS_DEFAULT,
  JWT_ACCESS_EXPIRY,
  LOGIN_FAIL_PREFIX,
  LOGIN_FAIL_TTL_SECONDS,
  MAX_DELAY_SECONDS,
  REFRESH_TOKEN_PREFIX,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants.js';
import type { JwtPayload, TokenPair } from './auth.types.js';

interface LoginFailRecord {
  count: number;
  lastAttempt: number;
}

class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

const OTP_PREFIX      = 'email-otp:';
const OTP_COOLDOWN    = 'email-otp-cd:';
const PAYMENT_TOKEN   = 'payment-token:';
const OTP_TTL         = 600;   // 10 minutes
const OTP_COOLDOWN_TTL = 60;   // 1 minute between resends
const PAYMENT_TTL     = 86400; // 24 hours
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  readonly saltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    this.jwtSecret = this.config.getOrThrow<string>('JWT_SECRET');
    this.saltRounds = Number(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') ?? BCRYPT_SALT_ROUNDS_DEFAULT,
    );
  }

  async register(name: string, email: string, password: string, orgName?: string): Promise<TokenPair> {
    if (this.config.get<string>('ALLOW_PUBLIC_SIGNUP') !== 'true') {
      throw new ForbiddenException('Public signup is not enabled');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Assign the default "Standard" policy to all self-registered users
    const defaultPolicy = await this.prisma.policy.findUnique({ where: { name: 'Standard' } });
    if (!defaultPolicy) {
      throw new HttpException('Default policy not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const passwordHash = await hash(password, this.saltRounds);
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'viewer',
        policyId: defaultPolicy.id,
        isActive: true,
        ...(orgName ? { orgName } : {}),
      },
      include: { policy: { select: { name: true } } },
    });

    return this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      policyName: user.policy?.name ?? 'Standard',
    });
  }

  async login(email: string, password: string): Promise<TokenPair> {
    await this.checkLoginDelay(email);

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { policy: { select: { name: true } } },
    });

    if (!user || !user.isActive) {
      await this.recordFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      await this.recordFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.clearFailedAttempts(email);

    return this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      policyName: user.policy?.name ?? 'Standard',
    });
  }

  private async checkLoginDelay(email: string): Promise<void> {
    const failData = await this.redis.get<LoginFailRecord>(`${LOGIN_FAIL_PREFIX}${email}`);
    if (!failData) return;

    const requiredDelayMs = Math.min(2 ** failData.count, MAX_DELAY_SECONDS) * 1000;
    const elapsedMs = Date.now() - failData.lastAttempt;
    if (elapsedMs < requiredDelayMs) {
      const remaining = Math.ceil((requiredDelayMs - elapsedMs) / 1000);
      throw new TooManyRequestsException(`Too many attempts. Try again in ${remaining}s`);
    }
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const key = `${LOGIN_FAIL_PREFIX}${email}`;
    const existing = await this.redis.get<LoginFailRecord>(key);
    await this.redis.set(
      key,
      { count: (existing?.count ?? 0) + 1, lastAttempt: Date.now() },
      { ttlSeconds: LOGIN_FAIL_TTL_SECONDS },
    );
  }

  private async clearFailedAttempts(email: string): Promise<void> {
    await this.redis.del(`${LOGIN_FAIL_PREFIX}${email}`);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const userId = await this.redis.get<string>(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old refresh token
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { policy: { select: { name: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      policyName: user.policy?.name ?? 'Standard',
    });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
  }

  async validateJwtPayload(payload: JwtPayload): Promise<JwtPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!user?.isActive) {
      return null;
    }

    return payload;
  }

  // ── Email verification ────────────────────────────────────────────────────

  async sendVerification(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('No account found for this email');
    if (user.isEmailVerified) throw new ConflictException('Email already verified');

    const onCooldown = await this.redis.get<string>(`${OTP_COOLDOWN}${email}`);
    if (onCooldown) {
      throw new HttpException('Please wait before requesting another code', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.redis.set(`${OTP_PREFIX}${email}`, { code, attempts: 0 }, { ttlSeconds: OTP_TTL });
    await this.redis.set(`${OTP_COOLDOWN}${email}`, '1', { ttlSeconds: OTP_COOLDOWN_TTL });

    await this.mail.sendOtp(email, code);
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ tokens: TokenPair; paymentToken: string }> {
    const record = await this.redis.get<{ code: string; attempts: number }>(`${OTP_PREFIX}${email}`);
    if (!record) throw new UnauthorizedException('Code expired or not found — request a new one');

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await this.redis.del(`${OTP_PREFIX}${email}`);
      throw new UnauthorizedException('Too many attempts — request a new code');
    }

    if (record.code !== code) {
      await this.redis.set(
        `${OTP_PREFIX}${email}`,
        { ...record, attempts: record.attempts + 1 },
        { ttlSeconds: OTP_TTL },
      );
      throw new UnauthorizedException('Incorrect code');
    }

    await this.redis.del(`${OTP_PREFIX}${email}`);

    const user = await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
      include: { policy: { select: { name: true } } },
    });

    const tokens = await this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      policyName: user.policy?.name ?? 'Standard',
    });

    // Generate a signed payment link token valid for 24 h
    const paymentToken = randomBytes(24).toString('hex');
    await this.redis.set(`${PAYMENT_TOKEN}${paymentToken}`, user.id, { ttlSeconds: PAYMENT_TTL });

    return { tokens, paymentToken };
  }

  // ── Payment flow ──────────────────────────────────────────────────────────

  async resolvePaymentToken(token: string): Promise<string> {
    const userId = await this.redis.get<string>(`${PAYMENT_TOKEN}${token}`);
    if (!userId) throw new UnauthorizedException('Payment link is invalid or expired');
    return userId;
  }

  async confirmPayment(userId: string, planLabel: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Send "activating" email immediately
    await this.mail.sendDropletActivating(user.email, user.name, planLabel, user.orgName ?? undefined);
  }

  async notifyDropletReady(userId: string, dropletIp: string, planLabel: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    await this.mail.sendDropletReady(user.email, user.name, dropletIp, planLabel, user.orgName ?? undefined);
  }

  /**
   * Send the "your viewer account is ready — sign in" welcome email for the
   * AI Agent Training path. Only sends to verified accounts; silently no-ops
   * otherwise so the endpoint can't be used to probe for or spam accounts.
   */
  async sendTrainingWelcome(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isEmailVerified) return;
    await this.mail.sendTrainingWelcome(user.email, user.name, user.orgName ?? undefined);
  }

  async sendPaymentLink(userId: string, planLabel: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const paymentToken = randomBytes(24).toString('hex');
    await this.redis.set(`${PAYMENT_TOKEN}${paymentToken}`, userId, { ttlSeconds: PAYMENT_TTL });
    await this.mail.sendPaymentLink(user.email, user.name, paymentToken, planLabel, user.orgName ?? undefined);
  }

  // ─────────────────────────────────────────────────────────────────────────

  private async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = this.jwt.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: JWT_ACCESS_EXPIRY,
    });

    const refreshToken = randomBytes(32).toString('hex');

    await this.redis.set(`${REFRESH_TOKEN_PREFIX}${refreshToken}`, payload.sub, {
      ttlSeconds: REFRESH_TOKEN_TTL_SECONDS,
    });

    return { accessToken, refreshToken };
  }
}
