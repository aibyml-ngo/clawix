'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authFetch } from '@/lib/auth';
import { formString } from '@/lib/form';
import { FieldError } from '@/components/ui/field-error';
import { type FieldErrors } from '@/lib/validation';
import { ModelCombobox } from './model-combobox';

/**
 * Shared agent-form building blocks used by both the admin agents page
 * (`user-agents/page.tsx`) and the agent dialogs (`agents-dialogs.tsx`).
 * Previously each file carried its own copy of `useProviders`,
 * `ProviderModelFields`, and `agentFormInput` (#111).
 */

export interface ProviderInfo {
  name: string;
  displayName: string;
  defaultModel: string;
  models: string[];
}

/** Fetch the configured providers once on mount. */
export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);

  useEffect(() => {
    void authFetch<{ data: ProviderInfo[] }>('/api/v1/agents/providers')
      .then((res) => {
        setProviders(Array.isArray(res.data) ? res.data : []);
      })
      .catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : 'Failed to load providers');
      });
  }, []);

  return providers;
}

/** Build the agent validation input object from a form's FormData. */
export function agentFormInput(fd: FormData) {
  return {
    name: formString(fd, 'name'),
    description: formString(fd, 'description'),
    systemPrompt: formString(fd, 'systemPrompt'),
    provider: formString(fd, 'provider'),
    model: formString(fd, 'model'),
    apiBaseUrl: formString(fd, 'apiBaseUrl'),
    maxTokensPerRun: formString(fd, 'maxTokensPerRun'),
  };
}

/** Linked Provider select + Model combobox, with inline validation errors. */
export function ProviderModelFields({
  providers,
  defaultProvider,
  defaultModel,
  idPrefix,
  errors,
}: {
  providers: ProviderInfo[];
  defaultProvider?: string;
  defaultModel?: string;
  idPrefix: string;
  errors?: FieldErrors;
}) {
  const [selectedProvider, setSelectedProvider] = useState(
    defaultProvider ?? providers[0]?.name ?? '',
  );
  const [dynamicModels, setDynamicModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const currentProvider = providers.find((p) => p.name === selectedProvider);

  useEffect(() => {
    if (!selectedProvider && providers.length > 0) {
      setSelectedProvider(defaultProvider ?? providers[0]?.name ?? '');
    }
  }, [providers, defaultProvider, selectedProvider]);

  // Fetch the provider's available models from its API when the provider
  // changes, falling back to the provider's static model list on error.
  useEffect(() => {
    if (!selectedProvider) return;
    setLoadingModels(true);
    setDynamicModels([]);
    authFetch<{ data: string[] }>(`/api/v1/agents/providers/${selectedProvider}/models`)
      .then((res) => setDynamicModels(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDynamicModels([]))
      .finally(() => setLoadingModels(false));
  }, [selectedProvider]);

  const models = dynamicModels.length > 0 ? dynamicModels : (currentProvider?.models ?? []);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-provider`}>Provider</Label>
        <Select value={selectedProvider} onValueChange={setSelectedProvider} name="provider">
          <SelectTrigger id={`${idPrefix}-provider`} className="w-full">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors?.['provider']} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-model`}>
          Model
          {loadingModels && (
            <Loader2 className="ml-2 inline size-3 animate-spin text-muted-foreground" />
          )}
        </Label>
        <ModelCombobox
          id={`${idPrefix}-model`}
          name="model"
          models={models}
          defaultValue={defaultModel ?? currentProvider?.defaultModel ?? ''}
          placeholder={loadingModels ? 'Loading models…' : currentProvider?.defaultModel || 'model-name'}
          required
        />
        <FieldError message={errors?.['model']} />
        <p className="text-xs text-muted-foreground">
          {loadingModels
            ? 'Fetching available models from the provider…'
            : 'Type any model name. Predefined models appear as suggestions.'}
        </p>
      </div>
    </>
  );
}
