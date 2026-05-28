import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateDropletInput } from '@clawix/shared';

const DO_API = 'https://api.digitalocean.com/v2';
const DROPLET_IMAGE = 'ubuntu-24-04-x64';

interface DoDropletResponse {
  droplet: {
    id: number;
    name: string;
    status: string;
    networks: {
      v4: Array<{ ip_address: string; type: string }>;
      v6: Array<{ ip_address: string; type: string }>;
    };
  };
}

interface DoSizeResponse {
  sizes: Array<{
    slug: string;
    description: string;
    vcpus: number;
    memory: number;
    disk: number;
    price_monthly: number;
    available: boolean;
    regions: string[];
  }>;
}

interface DoSshKeyResponse {
  ssh_key: { id: number; fingerprint: string; public_key: string; name: string };
}

interface DoErrorResponse {
  id: string;
  message: string;
}

@Injectable()
export class DigitalOceanService {
  private readonly logger = new Logger(DigitalOceanService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private headers() {
    const token = this.config.get<string>('DO_API_TOKEN');
    if (!token) {
      throw new InternalServerErrorException(
        'DO_API_TOKEN is not configured. Add it to your .env to enable droplet provisioning.',
      );
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /** Returns available sizes from DO filtered to what the user's account supports. */
  async listSizes(): Promise<DoSizeResponse['sizes']> {
    const res = await fetch(`${DO_API}/sizes?per_page=200`, { headers: this.headers() });
    if (!res.ok) {
      throw new InternalServerErrorException('Failed to fetch sizes from DigitalOcean');
    }
    const data = (await res.json()) as DoSizeResponse;
    return data.sizes.filter((s) => s.available);
  }

  /** Uploads an SSH public key to DO (idempotent — reuses existing key by fingerprint). */
  private async ensureSshKey(userId: string, publicKey: string): Promise<number> {
    const name = `clawix-user-${userId.slice(0, 8)}`;
    const res = await fetch(`${DO_API}/account/keys`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ name, public_key: publicKey.trim() }),
    });

    if (res.ok) {
      const data = (await res.json()) as DoSshKeyResponse;
      return data.ssh_key.id;
    }

    if (res.status === 422) {
      // Key already exists — look it up by listing keys and matching fingerprint
      const listRes = await fetch(`${DO_API}/account/keys?per_page=200`, {
        headers: this.headers(),
      });
      if (!listRes.ok) throw new InternalServerErrorException('Failed to list SSH keys on DO');
      const list = (await listRes.json()) as { ssh_keys: DoSshKeyResponse['ssh_key'][] };
      // The trimmed key content (without comment) to compare
      const keyBody = publicKey.trim().split(' ').slice(0, 2).join(' ');
      const existing = list.ssh_keys.find((k) => k.public_key.startsWith(keyBody));
      if (existing) return existing.id;
      throw new InternalServerErrorException('SSH key conflict but could not locate existing key');
    }

    const err = (await res.json().catch(() => ({ message: 'Unknown error' }))) as DoErrorResponse;
    throw new InternalServerErrorException(`Failed to upload SSH key: ${err.message}`);
  }

  /** Creates a droplet under the configured DO account and persists it in the DB. */
  async createDroplet(userId: string, input: CreateDropletInput): Promise<object> {
    const sshKeyId = await this.ensureSshKey(userId, input.sshPublicKey);

    const name = `clawix-${userId.slice(0, 8)}${input.nameSuffix ? `-${input.nameSuffix}` : ''}-${Date.now()}`;

    const body = {
      name,
      region: input.region,
      size: input.size,
      image: DROPLET_IMAGE,
      ssh_keys: [sshKeyId],
      backups: false,
      ipv6: true,
      tags: ['clawix', `user-${userId}`],
    };

    const res = await fetch(`${DO_API}/droplets`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({ message: 'Unknown error' }))) as DoErrorResponse;
      this.logger.error(`DO API error: ${res.status} ${err.message}`);
      if (res.status === 422) {
        throw new ForbiddenException(
          `DigitalOcean rejected the request: ${err.message}. GPU sizes require prior approval on your DO account.`,
        );
      }
      throw new InternalServerErrorException(`DigitalOcean error: ${err.message}`);
    }

    const data = (await res.json()) as DoDropletResponse;
    const d = data.droplet;

    return this.prisma.droplet.create({
      data: {
        userId,
        doDropletId: d.id,
        name: d.name,
        region: input.region,
        size: input.size,
        imageSlug: DROPLET_IMAGE,
        status: 'creating',
        ...(input.servicePackage ? { servicePackage: input.servicePackage } : {}),
        ...(input.serviceField   ? { serviceField:   input.serviceField   } : {}),
      },
    });
  }

  /** Syncs status + IPs from DO into the DB and returns the updated record. */
  async syncDroplet(userId: string, dropletId: string): Promise<object> {
    const record = await this.prisma.droplet.findFirst({
      where: { id: dropletId, userId },
    });
    if (!record) throw new NotFoundException('Droplet not found');

    const res = await fetch(`${DO_API}/droplets/${record.doDropletId}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new InternalServerErrorException('Failed to fetch droplet from DO');

    const data = (await res.json()) as DoDropletResponse;
    const d = data.droplet;

    const publicV4 = d.networks.v4.find((n) => n.type === 'public')?.ip_address ?? null;
    const publicV6 = d.networks.v6.find((n) => n.type === 'public')?.ip_address ?? null;

    const statusMap: Record<string, 'creating' | 'active' | 'off' | 'archive'> = {
      new: 'creating',
      active: 'active',
      off: 'off',
      archive: 'archive',
    };

    return this.prisma.droplet.update({
      where: { id: dropletId },
      data: {
        ipv4: publicV4,
        ipv6: publicV6,
        status: statusMap[d.status] ?? 'active',
      },
    });
  }

  /** Lists all droplets belonging to a user. */
  async listDroplets(userId: string): Promise<object[]> {
    return this.prisma.droplet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Deletes the droplet on DO and marks it deleting in the DB. */
  async deleteDroplet(userId: string, dropletId: string): Promise<void> {
    const record = await this.prisma.droplet.findFirst({
      where: { id: dropletId, userId },
    });
    if (!record) throw new NotFoundException('Droplet not found');

    const res = await fetch(`${DO_API}/droplets/${record.doDropletId}`, {
      method: 'DELETE',
      headers: this.headers(),
    });

    // 404 from DO means it was already deleted — treat as success
    if (!res.ok && res.status !== 404) {
      throw new InternalServerErrorException('Failed to delete droplet on DigitalOcean');
    }

    await this.prisma.droplet.update({
      where: { id: dropletId },
      data: { status: 'deleting' },
    });
  }
}
