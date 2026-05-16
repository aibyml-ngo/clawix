'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Cpu,
  Loader2,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authFetch } from '@/lib/auth';

interface PackAgent {
  name: string;
  role: string;
  model: string;
  description: string;
  skills?: string[];
  spawns?: string[];
  tier?: string;
  type?: string;
}

interface PackSubagent {
  name: string;
  model: string;
  description: string;
}

interface PackInspiration {
  title: string;
  prompt: string;
}

interface PackDetail {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tags: string[];
  skills: string[];
  agents: PackAgent[];
  subagents: PackSubagent[];
  inspirations: PackInspiration[];
  governance?: {
    humanInLoopActions?: string[];
    guardrails?: string[];
  };
}

function agentRoleLabel(agent: PackAgent): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  if (agent.role === 'primary') return { label: 'Coordinator', variant: 'default' };
  if (agent.tier === 'GUARD') return { label: 'Guard', variant: 'outline' };
  if (agent.type === 'subagent') return { label: 'Subagent', variant: 'secondary' };
  return { label: 'Agent', variant: 'secondary' };
}

function modelBadgeColor(model: string): string {
  if (model.includes('opus')) return 'text-purple-600 dark:text-purple-400';
  if (model.includes('sonnet')) return 'text-blue-600 dark:text-blue-400';
  return 'text-muted-foreground';
}

function modelShortName(model: string): string {
  if (model.includes('opus')) return 'Opus';
  if (model.includes('sonnet')) return 'Sonnet';
  if (model.includes('haiku')) return 'Haiku';
  return model;
}

export default function PackDetailPage() {
  const params = useParams<{ packId: string }>();
  const router = useRouter();
  const [pack, setPack] = useState<PackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch<{ success: boolean; data: PackDetail }>(`/api/v1/packs/${params.packId}`)
      .then((res) => setPack(res.data))
      .catch(() => setError('Failed to load pack'))
      .finally(() => setLoading(false));
  }, [params.packId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 size-4" /> Back
        </Button>
        <p className="text-sm text-destructive">{error || 'Pack not found'}</p>
      </div>
    );
  }

  const primaryAgents = pack.agents.filter((a) => a.role === 'primary');
  const guardAgents = pack.agents.filter((a) => a.tier === 'GUARD');
  const workerAgents = pack.agents.filter(
    (a) => a.role !== 'primary' && a.tier !== 'GUARD' && a.type !== 'subagent',
  );
  const subAgentsFromAgents = pack.agents.filter((a) => a.type === 'subagent');
  const allSubagents = [...subAgentsFromAgents, ...pack.subagents];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 w-fit" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 size-4" /> All packs
        </Button>
        <div className="flex items-start gap-5">
          <div
            className="flex size-16 flex-shrink-0 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: `${pack.color}20` }}
          >
            {pack.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{pack.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{pack.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pack.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-0 text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">

          {/* Inspiration prompts */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Try these conversations</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pack.inspirations.map((insp) => (
                <InspirationCard
                  key={insp.title}
                  title={insp.title}
                  prompt={insp.prompt}
                  color={pack.color}
                />
              ))}
            </div>
          </section>

          {/* Agents */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Agents</h2>
            </div>

            {primaryAgents.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Coordinator</p>
                {primaryAgents.map((agent) => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            )}

            {workerAgents.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Specialist Agents</p>
                {workerAgents.map((agent) => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            )}

            {guardAgents.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Guard Agents</p>
                {guardAgents.map((agent) => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            )}

            {allSubagents.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sub-agents</p>
                {(allSubagents as Array<PackAgent | PackSubagent>).map((item) =>
                  'role' in item ? (
                    <AgentCard key={item.name} agent={item as PackAgent} isSubagent />
                  ) : (
                    <SubagentCard key={item.name} subagent={item as PackSubagent} />
                  )
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* Skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Wrench className="size-4 text-muted-foreground" />
                Skills ({pack.skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {pack.skills.map((skill) => (
                <div key={skill} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                  <div className="size-1.5 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                  <span className="font-mono text-xs text-muted-foreground">{skill}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Governance */}
          {pack.governance && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="size-4 text-muted-foreground" />
                  Governance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {pack.governance.guardrails && pack.governance.guardrails.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Guardrails
                    </p>
                    <ul className="flex flex-col gap-1">
                      {pack.governance.guardrails.map((rule) => (
                        <li key={rule} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="mt-1 size-1 flex-shrink-0 rounded-full bg-muted-foreground/50" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pack.governance.humanInLoopActions && pack.governance.humanInLoopActions.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Human-in-loop actions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pack.governance.humanInLoopActions.map((action) => (
                        <Badge key={action} variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Model legend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Cpu className="size-4 text-muted-foreground" />
                Models used
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {Array.from(
                new Set([
                  ...pack.agents.map((a) => a.model),
                  ...pack.subagents.map((s) => s.model),
                ]),
              ).map((model) => (
                <div key={model} className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${modelBadgeColor(model)}`}>
                    {modelShortName(model)}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/70">{model}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent, isSubagent = false }: { agent: PackAgent; isSubagent?: boolean }) {
  const roleInfo = isSubagent
    ? { label: 'Subagent', variant: 'secondary' as const }
    : agentRoleLabel(agent);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
      <Bot className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium">{agent.name}</span>
          <Badge variant={roleInfo.variant} className="px-1.5 py-0 text-[10px]">
            {roleInfo.label}
          </Badge>
          {agent.tier && agent.tier !== 'GUARD' && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              {agent.tier}
            </Badge>
          )}
          <span className={`ml-auto text-xs font-medium ${modelBadgeColor(agent.model)}`}>
            {modelShortName(agent.model)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{agent.description}</p>
        {agent.spawns && agent.spawns.length > 0 && (
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            Spawns: {agent.spawns.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}

function SubagentCard({ subagent }: { subagent: PackSubagent }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
      <Cpu className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{subagent.name}</span>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            Subagent
          </Badge>
          <span className={`ml-auto text-xs font-medium ${modelBadgeColor(subagent.model)}`}>
            {modelShortName(subagent.model)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{subagent.description}</p>
      </div>
    </div>
  );
}

function InspirationCard({
  title,
  prompt,
  color,
}: {
  title: string;
  prompt: string;
  color: string;
}) {
  return (
    <button
      className="group flex cursor-pointer flex-col items-start justify-start rounded-lg border border-l-[3px] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md"
      style={{ borderLeftColor: color, borderColor: `${color}30` }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = `${color}0f`;
        el.style.borderColor = `${color}60`;
        el.style.boxShadow = `0 8px 24px -8px ${color}55`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = '';
        el.style.borderColor = `${color}30`;
        el.style.boxShadow = '';
      }}
    >
      <span className="text-sm font-semibold tracking-tight">{title}</span>
      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {prompt}
      </span>
    </button>
  );
}
