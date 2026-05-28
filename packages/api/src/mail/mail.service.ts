import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly appName: string;
  private readonly webUrl: string;

  constructor(private readonly config: ConfigService) {
    this.from   = config.get('SMTP_FROM') ?? 'Clawix <noreply@clawix.aibyml.com>';
    this.appName = config.get('APP_NAME') ?? 'Clawix';
    this.webUrl  = config.get('NEXT_PUBLIC_API_URL')?.replace(':3001', ':3000') ?? 'http://localhost:3000';

    this.transporter = nodemailer.createTransport({
      host:   config.get('SMTP_HOST') ?? 'smtp.gmail.com',
      port:   Number(config.get('SMTP_PORT') ?? 587),
      secure: config.get('SMTP_SECURE') === 'true',
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendOtp(email: string, code: string): Promise<void> {
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px">${this.appName}</h2>
        <p style="margin:0 0 24px;color:#6b7280">Verify your email address</p>
        <p style="margin:0 0 16px;color:#111827">
          Use the code below to confirm your email. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="letter-spacing:12px;font-size:36px;font-weight:700;color:#111827;
                    background:#f3f4f6;border-radius:8px;padding:20px 24px;
                    text-align:center;margin-bottom:24px">${code}</div>
        <p style="margin:0;color:#6b7280;font-size:13px">
          If you didn't sign up for ${this.appName}, you can safely ignore this email.
        </p>
      </div>`;

    await this.send(email, `${code} — your ${this.appName} verification code`, html);
  }

  async sendTrainingWelcome(email: string, name: string, orgName?: string): Promise<void> {
    const brand = orgName ?? this.appName;
    const url = `${this.webUrl}/login`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px">${brand}</h2>
        <p style="margin:0 0 24px;color:#6b7280">Your AI Agent Training account is ready</p>
        <p style="margin:0 0 16px;color:#111827">Hi ${name},</p>
        <p style="margin:0 0 16px;color:#111827">
          Welcome to AI Agent Training with ${brand}! Your account has been created with
          <strong>viewer</strong> access. You can sign in any time to start your training.
        </p>
        <a href="${url}"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;
                  margin-bottom:24px">
          Sign in to your account →
        </a>
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px">
          Or copy this link: <span style="color:#2563eb">${url}</span>
        </p>
        <p style="margin:0;color:#6b7280;font-size:13px">
          Sign in with the email and password you chose at signup.
        </p>
      </div>`;

    await this.send(email, `Welcome to AI Agent Training with ${brand} — sign in to get started`, html);
  }

  async sendPaymentLink(email: string, name: string, token: string, planLabel: string, orgName?: string): Promise<void> {
    const brand = orgName ?? this.appName;
    const url = `${this.webUrl}/payment?token=${token}`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px">${brand}</h2>
        <p style="margin:0 0 24px;color:#6b7280">Your Cloud Computer (Droplet) is being set up</p>
        <p style="margin:0 0 16px;color:#111827">Hi ${name},</p>
        <p style="margin:0 0 16px;color:#111827">
          Your email is verified and we've started provisioning your
          <strong>${planLabel}</strong> Cloud Computer (Droplet). To activate it, please complete your subscription payment.
        </p>
        <a href="${url}"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;
                  margin-bottom:24px">
          Complete payment →
        </a>
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px">
          Or copy this link: <span style="color:#2563eb">${url}</span>
        </p>
        <p style="margin:0;color:#6b7280;font-size:13px">Link expires in 24 hours.</p>
      </div>`;

    await this.send(email, `Activate your ${brand} Cloud Computer (Droplet) — complete payment`, html);
  }

  async sendDropletReady(
    email: string,
    name: string,
    dropletIp: string,
    planLabel: string,
    orgName?: string,
  ): Promise<void> {
    const brand = orgName ?? this.appName;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px">${brand}</h2>
        <p style="margin:0 0 24px;color:#6b7280">Your Cloud Computer (Droplet) is ready</p>
        <p style="margin:0 0 16px;color:#111827">Hi ${name},</p>
        <p style="margin:0 0 16px;color:#111827">
          Your <strong>${planLabel}</strong> Cloud Computer (Droplet) is live. Connect with:
        </p>
        <div style="background:#111827;color:#f9fafb;font-family:monospace;font-size:14px;
                    border-radius:8px;padding:16px 20px;margin-bottom:24px">
          ssh root@${dropletIp}
        </div>
        <p style="margin:0 0 8px;color:#111827">
          <strong>IP address:</strong> <code>${dropletIp}</code>
        </p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:13px">
          Use the SSH public key you provided at signup. If you need help, reply to this email.
        </p>
        <a href="${this.webUrl}/conversations"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
          Open ${brand} dashboard →
        </a>
      </div>`;

    await this.send(email, `Your ${brand} Cloud Computer (Droplet) is ready — ${dropletIp}`, html);
  }

  async sendDropletActivating(email: string, name: string, planLabel: string, orgName?: string): Promise<void> {
    const brand = orgName ?? this.appName;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px">${brand}</h2>
        <p style="margin:0 0 24px;color:#6b7280">Payment received — activating your Cloud Computer (Droplet)</p>
        <p style="margin:0 0 16px;color:#111827">Hi ${name},</p>
        <p style="margin:0 0 16px;color:#111827">
          Payment confirmed. Your <strong>${planLabel}</strong> Cloud Computer (Droplet) is being activated.
          We'll send another email with your IP address and SSH details within a few minutes.
        </p>
        <a href="${this.webUrl}/conversations"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">
          Go to ${brand} dashboard →
        </a>
      </div>`;

    await this.send(email, `Payment confirmed — your ${brand} Cloud Computer (Droplet) is activating`, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.config.get('SMTP_USER')) {
      this.logger.warn(`SMTP_USER not set — skipping email to ${to}: ${subject}`);
      this.logger.debug(`[MOCK EMAIL] To: ${to}\nSubject: ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error({ err }, `Failed to send email to ${to}`);
    }
  }
}
