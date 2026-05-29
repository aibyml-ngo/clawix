'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { authFetch } from '@/lib/auth';
import { useLanguage } from '@/i18n';
import type { ApiAgent } from './agents-list';

// ------------------------------------------------------------------ //
//  Provider data                                                      //
// ------------------------------------------------------------------ //

interface ProviderInfo {
  name: string;
  displayName: string;
  defaultModel: string;
  models: string[];
}

function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);

  useEffect(() => {
    void authFetch<{ data: ProviderInfo[] }>('/api/v1/agents/providers')
      .then((res) => {
        setProviders(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {});
  }, []);

  return providers;
}

// ------------------------------------------------------------------ //
//  Provider + Model selects (linked)                                  //
// ------------------------------------------------------------------ //

function ProviderModelFields({
  providers,
  defaultProvider,
  defaultModel,
  idPrefix,
}: {
  providers: ProviderInfo[];
  defaultProvider?: string;
  defaultModel?: string;
  idPrefix: string;
}) {
  const { t } = useLanguage();
  const [selectedProvider, setSelectedProvider] = useState(
    defaultProvider ?? providers[0]?.name ?? '',
  );
  const [dynamicModels, setDynamicModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const currentProvider = providers.find((p) => p.name === selectedProvider);

  // Set default provider when providers load
  useEffect(() => {
    if (!selectedProvider && providers.length > 0) {
      setSelectedProvider(defaultProvider ?? providers[0]!.name);
    }
  }, [providers, defaultProvider, selectedProvider]);

  // Fetch available models from the provider API when provider changes
  useEffect(() => {
    if (!selectedProvider) return;
    setLoadingModels(true);
    setDynamicModels([]);
    authFetch<{ data: string[] }>(`/api/v1/agents/providers/${selectedProvider}/models`)
      .then((res) => setDynamicModels(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDynamicModels(currentProvider?.models ?? []))
      .finally(() => setLoadingModels(false));
  }, [selectedProvider]);

  const models = dynamicModels.length > 0 ? dynamicModels : (currentProvider?.models ?? []);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-provider`}>{t('agentDialogs.providerLabel')}</Label>
        <select
          name="provider"
          id={`${idPrefix}-provider`}
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={selectedProvider}
          onChange={(e) => {
            setSelectedProvider(e.target.value);
          }}
        >
          {providers.map((p) => (
            <option key={p.name} value={p.name}>
              {p.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-model`}>
          {t('agentDialogs.modelLabel')}
          {loadingModels && <Loader2 className="ml-2 inline size-3 animate-spin text-muted-foreground" />}
        </Label>
        <Input
          id={`${idPrefix}-model`}
          name="model"
          list={`${idPrefix}-model-suggestions`}
          placeholder={loadingModels ? t('agentDialogs.modelLoadingPlaceholder') : (currentProvider?.defaultModel || 'model-name')}
          defaultValue={defaultModel ?? currentProvider?.defaultModel ?? ''}
          required
        />
        {models.length > 0 && (
          <datalist id={`${idPrefix}-model-suggestions`}>
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        )}
        <p className="text-xs text-muted-foreground">
          {loadingModels
            ? t('agentDialogs.modelFetchingHelp')
            : t('agentDialogs.modelSelectHelp')}
        </p>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ //
//  Create Agent Dialog                                                //
// ------------------------------------------------------------------ //

export function CreateAgentDialog({
  open,
  onOpenChange,
  saving,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  onSubmit: (form: FormData) => void;
}) {
  const { t } = useLanguage();
  const providers = useProviders();
  const [streamingEnabled, setStreamingEnabled] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('agentDialogs.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('agentDialogs.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set('streamingEnabled', String(streamingEnabled));
            onSubmit(fd);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-name">{t('agentDialogs.nameLabel')}</Label>
            <Input id="create-name" name="name" placeholder={t('agentDialogs.namePlaceholder')} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-description">{t('agentDialogs.descriptionLabel')}</Label>
            <textarea
              id="create-description"
              name="description"
              rows={2}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={t('agentDialogs.descriptionPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-systemPrompt">{t('agentDialogs.systemPromptLabel')}</Label>
            <textarea
              id="create-systemPrompt"
              name="systemPrompt"
              rows={6}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={t('agentDialogs.systemPromptPlaceholder')}
              required
            />
          </div>

          {/* Role is always worker for user-created agents; primary is system-only */}
          <input type="hidden" name="role" value="worker" />

          <ProviderModelFields providers={providers} idPrefix="create" />

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-apiBaseUrl">{t('agentDialogs.apiBaseUrlLabel')}</Label>
            <Input
              id="create-apiBaseUrl"
              name="apiBaseUrl"
              placeholder="https://api.example.com/v1"
            />
            <p className="text-xs text-muted-foreground">
              {t('agentDialogs.apiBaseUrlHelp')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-maxTokensPerRun">{t('agentDialogs.maxTokensLabel')}</Label>
            <Input
              id="create-maxTokensPerRun"
              name="maxTokensPerRun"
              type="number"
              defaultValue={100000}
              min={1000}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-skillIds">{t('agentDialogs.skillIdsLabel')}</Label>
            <Input id="create-skillIds" name="skillIds" placeholder={t('agentDialogs.skillIdsPlaceholder')} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="create-streamingEnabled" className="text-base">
                {t('agentDialogs.streamingLabel')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('agentDialogs.streamingHelp')}
              </p>
            </div>
            <Switch
              id="create-streamingEnabled"
              checked={streamingEnabled}
              onCheckedChange={setStreamingEnabled}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {t('agentDialogs.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('agentDialogs.createSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------------ //
//  Edit Agent Dialog                                                  //
// ------------------------------------------------------------------ //

export function EditAgentDialog({
  agent,
  onOpenChange,
  saving,
  onSubmit,
}: {
  agent: ApiAgent | null;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  onSubmit: (id: string, form: FormData) => void;
}) {
  const { t } = useLanguage();
  const providers = useProviders();
  const [streamingEnabled, setStreamingEnabled] = useState(agent?.streamingEnabled ?? false);

  if (!agent) return null;

  return (
    <Dialog open={agent !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('agentDialogs.editTitle')}</DialogTitle>
          <DialogDescription>{t('agentDialogs.editDescription', { name: agent.name })}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set('streamingEnabled', String(streamingEnabled));
            onSubmit(agent.id, fd);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">{t('agentDialogs.nameLabel')}</Label>
            <Input id="edit-name" name="name" defaultValue={agent.name} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-description">{t('agentDialogs.descriptionLabel')}</Label>
            <textarea
              id="edit-description"
              name="description"
              rows={2}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              defaultValue={agent.description}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-systemPrompt">{t('agentDialogs.systemPromptLabel')}</Label>
            <textarea
              id="edit-systemPrompt"
              name="systemPrompt"
              rows={6}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              defaultValue={agent.systemPrompt}
              required
            />
          </div>

          {/* Role cannot be changed; primary is system-only, workers stay workers */}
          <div className="flex flex-col gap-2">
            <Label>{t('agentDialogs.roleLabel')}</Label>
            <p className="text-sm text-muted-foreground">
              {agent.role === 'primary'
                ? t('agentDialogs.rolePrimary')
                : t('agentDialogs.roleWorker')}
            </p>
            <input type="hidden" name="role" value={agent.role} />
          </div>

          <ProviderModelFields
            providers={providers}
            defaultProvider={agent.provider}
            defaultModel={agent.model}
            idPrefix="edit"
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-apiBaseUrl">{t('agentDialogs.apiBaseUrlLabel')}</Label>
            <Input
              id="edit-apiBaseUrl"
              name="apiBaseUrl"
              defaultValue={agent.apiBaseUrl ?? ''}
              placeholder="https://api.example.com/v1"
            />
            <p className="text-xs text-muted-foreground">
              {t('agentDialogs.apiBaseUrlHelp')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-maxTokensPerRun">{t('agentDialogs.maxTokensLabel')}</Label>
            <Input
              id="edit-maxTokensPerRun"
              name="maxTokensPerRun"
              type="number"
              defaultValue={agent.maxTokensPerRun ?? 100000}
              min={1000}
            />
          </div>

          {agent.role !== 'primary' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-isActive">{t('agentDialogs.statusLabel')}</Label>
              <select
                name="isActive"
                id="edit-isActive"
                className="rounded-md border bg-background px-3 py-2 text-sm"
                defaultValue={agent.isActive ? 'true' : 'false'}
              >
                <option value="true">{t('agentDialogs.statusActive')}</option>
                <option value="false">{t('agentDialogs.statusInactive')}</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-streamingEnabled" className="text-base">
                {t('agentDialogs.streamingLabel')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('agentDialogs.streamingHelp')}
              </p>
            </div>
            <Switch
              id="edit-streamingEnabled"
              checked={streamingEnabled}
              onCheckedChange={setStreamingEnabled}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {t('agentDialogs.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('agentDialogs.editSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
