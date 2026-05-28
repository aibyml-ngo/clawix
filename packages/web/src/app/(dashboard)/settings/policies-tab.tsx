'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MoreHorizontal, Plus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { authFetch } from '@/lib/auth';
import { useLanguage } from '@/i18n';
import { SuccessDialog } from '@/components/ui/success-dialog';
import { CreatePolicyDialog, EditPolicyDialog } from './policies-dialogs';

// ------------------------------------------------------------------ //
//  Types (exported for use in dialogs)                                //
// ------------------------------------------------------------------ //

export interface ApiPolicy {
  id: string;
  name: string;
  description: string | null;
  maxTokenBudget: number | null;
  maxAgents: number;
  maxSkills: number;
  maxMemoryItems: number;
  maxGroupsOwned: number;
  allowedProviders: string[];
  cronEnabled: boolean;
  maxScheduledTasks: number;
  minCronIntervalSecs: number;
  maxTokensPerCronRun: number | null;
  features: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedPolicies {
  data: ApiPolicy[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface ApiProvider {
  provider: string;
  displayName: string;
}

// ------------------------------------------------------------------ //
//  Helpers                                                            //
// ------------------------------------------------------------------ //

function formatBudget(cents: number | null, t: (key: string) => string): string {
  if (cents === null) return t('settingsTabs.unlimited');
  return `$${(cents / 100).toFixed(2)}/mo`;
}

// ------------------------------------------------------------------ //
//  Component                                                          //
// ------------------------------------------------------------------ //

export function PoliciesTab() {
  const { t } = useLanguage();
  const [policies, setPolicies] = useState<ApiPolicy[]>([]);
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<ApiPolicy | null>(null);
  const [deletePolicy, setDeletePolicy] = useState<ApiPolicy | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [policiesRes, providersRes] = await Promise.all([
        authFetch<PaginatedPolicies>('/admin/policies?limit=100'),
        authFetch<ApiProvider[]>('/admin/providers'),
      ]);
      setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
      const nameMap: Record<string, string> = {};
      for (const p of providersRes ?? []) {
        nameMap[p.provider] = p.displayName;
      }
      setProviderNames(nameMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.policiesLoadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleCreate(data: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      await authFetch('/admin/policies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setCreateOpen(false);
      await fetchData();
      setSuccessMessage(
        t('settingsTabs.policyCreatedMessage', {
          name: (data as { name?: string }).name ?? t('settingsTabs.policyFallbackName'),
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.policyCreateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(policy: ApiPolicy) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/policies/${policy.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !policy.isActive }),
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.policyUpdateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, data: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/policies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setEditPolicy(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.policyUpdateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/policies/${id}`, { method: 'DELETE' });
      setDeletePolicy(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.policyDeleteError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <Button
          size="sm"
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          {t('settingsTabs.createPolicy')}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : policies.length === 0 ? (
        <div className="rounded-md border bg-background/30 backdrop-blur-sm p-8 text-center text-sm text-muted-foreground">
          {t('settingsTabs.policiesEmpty')}
        </div>
      ) : (
        <div className="rounded-md border bg-background/30 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('settingsTabs.colPolicy')}</TableHead>
                <TableHead>{t('settingsTabs.colTokenBudget')}</TableHead>
                <TableHead>{t('settingsTabs.colAgents')}</TableHead>
                <TableHead>{t('settingsTabs.colProviders')}</TableHead>
                <TableHead>{t('settingsTabs.colActive')}</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4" />
                      {p.name}
                    </div>
                    {p.description && (
                      <span className="text-xs text-muted-foreground">{p.description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {formatBudget(p.maxTokenBudget, t)}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm">{p.maxAgents}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const configured = p.allowedProviders.filter(
                          (prov) => prov in providerNames,
                        );
                        return configured.length > 0 ? (
                          configured.map((prov) => (
                            <Badge key={prov} variant="outline" className="text-xs">
                              {providerNames[prov]}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t('settingsTabs.providersNone')}
                          </span>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.isActive}
                      onCheckedChange={() => {
                        void handleToggleActive(p);
                      }}
                      disabled={saving}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditPolicy(p);
                          }}
                        >
                          {t('settingsTabs.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => {
                            setDeletePolicy(p);
                          }}
                        >
                          {t('settingsTabs.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreatePolicyDialog
        key={createOpen ? 'create-open' : 'create-closed'}
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={saving}
        onSubmit={handleCreate}
      />

      <EditPolicyDialog
        key={editPolicy?.id ?? 'none'}
        policy={editPolicy}
        onOpenChange={(open) => {
          if (!open) setEditPolicy(null);
        }}
        saving={saving}
        onSubmit={handleUpdate}
      />

      <AlertDialog
        open={deletePolicy !== null}
        onOpenChange={(open) => {
          if (!open) setDeletePolicy(null);
        }}
      >
        {deletePolicy && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settingsTabs.deletePolicyTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settingsTabs.deletePolicyConfirmBefore')}
                <strong>{deletePolicy.name}</strong>
                {t('settingsTabs.deletePolicyConfirmAfter')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('settingsTabs.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  void handleDelete(deletePolicy.id);
                }}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t('settingsTabs.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>

      <SuccessDialog
        open={successMessage !== ''}
        onOpenChange={(open) => {
          if (!open) setSuccessMessage('');
        }}
        title={t('settingsTabs.policyCreatedTitle')}
        description={successMessage}
      />
    </>
  );
}
