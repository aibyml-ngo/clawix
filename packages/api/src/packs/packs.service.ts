import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { createLogger } from '@clawix/shared';

export interface PackInspiration {
  readonly title: string;
  readonly prompt: string;
}

export interface PackAgent {
  readonly name: string;
  readonly role: string;
  readonly model: string;
  readonly description: string;
  readonly skills?: readonly string[];
  readonly spawns?: readonly string[];
  readonly tier?: string;
}

export interface PackSubagent {
  readonly name: string;
  readonly model: string;
  readonly description: string;
}

export interface PackSummary {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly skillCount: number;
  readonly agentCount: number;
}

export interface PackDetail extends PackSummary {
  readonly skills: readonly string[];
  readonly agents: readonly PackAgent[];
  readonly subagents: readonly PackSubagent[];
  readonly inspirations: readonly PackInspiration[];
  readonly governance?: Record<string, unknown>;
}

const logger = createLogger('packs');

@Injectable()
export class PacksService {
  constructor(private readonly packsDir: string) {}

  async listPacks(): Promise<readonly PackSummary[]> {
    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(this.packsDir, { withFileTypes: true });
    } catch {
      return [];
    }

    const packs: PackSummary[] = [];
    for (const entry of entries) {
      if (!entry.name.endsWith('.json') || !entry.isFile()) continue;
      const detail = await this.readPackFile(entry.name);
      if (!detail) continue;
      packs.push({
        id: detail.id,
        name: detail.name,
        icon: detail.icon,
        color: detail.color,
        description: detail.description,
        tags: detail.tags,
        skillCount: detail.skills.length,
        agentCount: detail.agents.length,
      });
    }
    return packs.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPack(id: string): Promise<PackDetail> {
    const detail = await this.readPackFile(`${id}.json`);
    if (!detail) throw new NotFoundException(`Pack "${id}" not found`);
    return detail;
  }

  private async readPackFile(filename: string): Promise<PackDetail | null> {
    const filePath = path.join(this.packsDir, filename);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (!parsed['id'] || !parsed['name']) return null;
      return {
        id: String(parsed['id']),
        name: String(parsed['name']),
        icon: String(parsed['icon'] ?? '📦'),
        color: String(parsed['color'] ?? '#6b7280'),
        description: String(parsed['description'] ?? ''),
        tags: Array.isArray(parsed['tags']) ? (parsed['tags'] as string[]) : [],
        skills: Array.isArray(parsed['skills']) ? (parsed['skills'] as string[]) : [],
        agents: Array.isArray(parsed['agents']) ? (parsed['agents'] as PackAgent[]) : [],
        subagents: Array.isArray(parsed['subagents']) ? (parsed['subagents'] as PackSubagent[]) : [],
        inspirations: Array.isArray(parsed['inspirations']) ? (parsed['inspirations'] as PackInspiration[]) : [],
        governance: typeof parsed['governance'] === 'object' && parsed['governance'] !== null
          ? (parsed['governance'] as Record<string, unknown>)
          : undefined,
        skillCount: Array.isArray(parsed['skills']) ? parsed['skills'].length : 0,
        agentCount: Array.isArray(parsed['agents']) ? parsed['agents'].length : 0,
      };
    } catch (err) {
      logger.warn({ filename, err }, 'Failed to parse pack file');
      return null;
    }
  }
}
