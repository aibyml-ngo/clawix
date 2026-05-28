'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MoreHorizontal, Plus, Star, Zap } from 'lucide-react';
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
import { CreateProviderDialog, EditProviderDialog } from './providers-dialogs';

// ------------------------------------------------------------------ //
//  Types (exported for use in dialogs)                                //
// ------------------------------------------------------------------ //

export interface ApiProvider {
  id: string;
  provider: string;
  displayName: string;
  apiKey: string; // masked
  apiBaseUrl: string | null;
  isEnabled: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
}

// ------------------------------------------------------------------ //
//  Component                                                          //
// ------------------------------------------------------------------ //

export function ProvidersTab() {
  const { t } = useLanguage();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<ApiProvider | null>(null);
  const [deleteProvider, setDeleteProvider] = useState<ApiProvider | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch<ApiProvider[]>('/admin/providers');
      setProviders(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.providersLoadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchProviders();
  }, [fetchProviders]);

  async function handleCreate(data: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      await authFetch('/admin/providers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setCreateOpen(false);
      await fetchProviders();
      setSuccessMessage(
        t('settingsTabs.providerAddedMessage', {
          name:
            (data as { displayName?: string }).displayName ??
            t('settingsTabs.providerFallbackName'),
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.providerCreateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled(provider: ApiProvider) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/providers/${provider.provider}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: !provider.isEnabled }),
      });
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.providerUpdateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(provider: ApiProvider) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/providers/${provider.provider}`, {
        method: 'PATCH',
        body: JSON.stringify({ isDefault: true }),
      });
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.providerSetDefaultError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(providerName: string, data: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/providers/${providerName}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setEditProvider(null);
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.providerUpdateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(providerName: string) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/providers/${providerName}`, { method: 'DELETE' });
      setDeleteProvider(null);
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTabs.providerDeleteError'));
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
          {t('settingsTabs.addProvider')}
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
      ) : providers.length === 0 ? (
        <div className="rounded-md border bg-background/30 backdrop-blur-sm p-8 text-center text-sm text-muted-foreground">
          {t('settingsTabs.providersEmpty')}
        </div>
      ) : (
        <div className="rounded-md border bg-background/30 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('settingsTabs.colProvider')}</TableHead>
                <TableHead>{t('settingsTabs.colApiKey')}</TableHead>
                <TableHead>{t('settingsTabs.colBaseUrl')}</TableHead>
                <TableHead>{t('settingsTabs.colDefault')}</TableHead>
                <TableHead>{t('settingsTabs.colEnabled')}</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4" />
                      {p.displayName}
                    </div>
                    <span className="text-xs text-muted-foreground">{p.provider}</span>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">{p.apiKey}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.apiBaseUrl ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.isDefault ? 'default' : 'outline'}
                      className={`cursor-pointer gap-1 text-xs ${p.isDefault ? '' : 'opacity-40 hover:opacity-70'}`}
                      onClick={() => {
                        if (!p.isDefault) void handleSetDefault(p);
                      }}
                    >
                      <Star className={`size-3 ${p.isDefault ? 'fill-current' : ''}`} />
                      {t('settingsTabs.defaultBadge')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.isEnabled}
                      onCheckedChange={() => {
                        void handleToggleEnabled(p);
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
                            setEditProvider(p);
                          }}
                        >
                          {t('settingsTabs.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => {
                            setDeleteProvider(p);
                          }}
                        >
                          {t('settingsTabs.remove')}
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

      <CreateProviderDialog
        key={createOpen ? 'create-open' : 'create-closed'}
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={saving}
        onSubmit={handleCreate}
      />

      <EditProviderDialog
        key={editProvider?.id ?? 'none'}
        provider={editProvider}
        onOpenChange={(open) => {
          if (!open) setEditProvider(null);
        }}
        saving={saving}
        onSubmit={handleUpdate}
      />

      <AlertDialog
        open={deleteProvider !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteProvider(null);
        }}
      >
        {deleteProvider && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settingsTabs.removeProviderTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settingsTabs.removeProviderConfirmBefore')}
                <strong>{deleteProvider.displayName}</strong> ({deleteProvider.provider})
                {t('settingsTabs.removeProviderConfirmAfter')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('settingsTabs.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  void handleDelete(deleteProvider.provider);
                }}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t('settingsTabs.remove')}
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
        title={t('settingsTabs.providerAddedTitle')}
        description={successMessage}
      />
    </>
  );
}
