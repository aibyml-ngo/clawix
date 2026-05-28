'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Bot, CalendarClock, Coins, Loader2 } from 'lucide-react';
import { useAnimeOnMount, staggerFadeUp, STAGGER } from '@/lib/anime';
import { VantaBackground } from '@/components/ui/vanta-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/auth';
import { useLanguage } from '@/i18n';

interface DashboardStats {
  totalRuns: number;
  activeAgents: number;
  tokenUsage: {
    totalTokens: number;
    totalEstimatedCostUsd: number;
  };
  scheduledTasks: number;
}

interface RecentRun {
  id: string;
  agentName: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

interface RecentActivity {
  id: string;
  userName: string;
  action: string;
  resource: string;
  createdAt: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}

type TFunc = (key: string, params?: Record<string, string | number>) => string;

function formatTimeAgo(iso: string, t: TFunc): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return t('dashboardPage.timeJustNow');
  if (mins < 60) return t('dashboardPage.timeMinAgo', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('dashboardPage.timeHourAgo', { n: hours });
  const days = Math.floor(hours / 24);
  return t('dashboardPage.timeDayAgo', { n: days });
}

function statusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'secondary' as const;
    case 'failed':
      return 'destructive' as const;
    case 'running':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useAnimeOnMount(staggerFadeUp('[data-animate="stat-cards"] > div', { stagger: STAGGER.wide }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, runsRes, activityRes] = await Promise.all([
        authFetch<DashboardStats>('/api/v1/dashboard/stats'),
        authFetch<RecentRun[]>('/api/v1/dashboard/recent-runs'),
        authFetch<RecentActivity[]>('/api/v1/dashboard/recent-activity'),
      ]);
      setStats(statsRes);
      setRecentRuns(Array.isArray(runsRes) ? runsRes : []);
      setRecentActivity(Array.isArray(activityRes) ? activityRes : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboardPage.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const statCards = [
    {
      title: t('dashboardPage.statTotalRuns'),
      value: stats ? formatNumber(stats.totalRuns) : '—',
      subtitle: t('dashboardPage.statTotalRunsSub'),
      icon: Activity,
    },
    {
      title: t('dashboardPage.statActiveAgents'),
      value: stats ? String(stats.activeAgents) : '—',
      subtitle: t('dashboardPage.statActiveAgentsSub'),
      icon: Bot,
    },
    {
      title: t('dashboardPage.statTokenUsage'),
      value: stats ? formatNumber(stats.tokenUsage.totalTokens) : '—',
      subtitle: stats
        ? t('dashboardPage.statTokenUsageSub', {
            cost: stats.tokenUsage.totalEstimatedCostUsd.toFixed(2),
          })
        : '',
      icon: Coins,
    },
    {
      title: t('dashboardPage.statPendingTasks'),
      value: stats ? String(stats.scheduledTasks) : '—',
      subtitle: t('dashboardPage.statPendingTasksSub'),
      icon: CalendarClock,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{t('dashboardPage.title')}</h1>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              {t('dashboardPage.overview')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboardPage.intro')}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <VantaBackground effect="topology" className="min-h-[calc(100vh-3.5rem)] p-6">
      <div className="flex flex-col gap-6">
        <div className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{t('dashboardPage.title')}</h1>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
              {t('dashboardPage.overview')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboardPage.intro')}</p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Stats cards */}
        <div data-animate="stat-cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                {stat.subtitle && <p className="text-xs text-muted-foreground">{stat.subtitle}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Recent runs table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t('dashboardPage.recentRuns')}</CardTitle>
              <CardDescription>{t('dashboardPage.recentRunsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRuns.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t('dashboardPage.noRuns')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboardPage.colAgent')}</TableHead>
                      <TableHead>{t('dashboardPage.colStatus')}</TableHead>
                      <TableHead>{t('dashboardPage.colDuration')}</TableHead>
                      <TableHead>{t('dashboardPage.colTime')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.agentName}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatDuration(run.durationMs)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTimeAgo(run.startedAt, t)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('dashboardPage.recentActivity')}</CardTitle>
              <CardDescription>{t('dashboardPage.recentActivityDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t('dashboardPage.noActivity')}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex-1 text-sm">
                        <p>
                          <span className="font-medium">{activity.userName}</span>{' '}
                          <span className="text-muted-foreground">{activity.action}</span>{' '}
                          <span>{activity.resource}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.createdAt, t)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </VantaBackground>
  );
}
