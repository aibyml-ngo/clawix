'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useLanguage } from '@/i18n';
import { ApiError } from '@/lib/api';
import {
  extractText,
  freeFormTags,
  getDomain,
  isOrgShared as itemIsOrgShared,
  memoryApi,
  type MemoryItem,
} from '@/lib/api/memory';

type Target = { mode: 'create'; defaultDomain?: string } | { mode: 'edit'; item: MemoryItem };

interface Props {
  target: Target;
  knownDomains: readonly string[];
  canMutate: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const DOMAIN_REGEX = /^[a-z0-9][a-z0-9-]{0,30}$/;

function slugifyDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 31);
}

function parseFreeFormTags(raw: string): string[] {
  const out = new Set<string>();
  for (const piece of raw.split(',')) {
    const slug = piece
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    if (slug && slug !== 'public' && !slug.startsWith('domain:') && !slug.startsWith('daily:')) {
      out.add(slug);
    }
  }
  return [...out];
}

export function CardEditor({ target, knownDomains, canMutate, isAdmin, onClose, onSaved }: Props) {
  const { t } = useLanguage();
  const isEdit = target.mode === 'edit';
  const item = isEdit ? target.item : null;
  const wasOrgShared = item ? itemIsOrgShared(item) : false;
  // Non-admins can keep/remove an already-org-shared row but cannot ADD it.
  // Service enforces the same rule server-side.
  const canToggleOrgShare = canMutate && (isAdmin || wasOrgShared);

  const [body, setBody] = useState(item ? extractText(item.content) : '');
  const [domain, setDomain] = useState(
    item ? getDomain(item) : (target.mode === 'create' && target.defaultDomain) || '',
  );
  const [newDomainInput, setNewDomainInput] = useState('');
  const [tagsInput, setTagsInput] = useState(item ? freeFormTags(item).join(', ') : '');
  const [orgShared, setOrgShared] = useState(wasOrgShared);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [body, domain, tagsInput, orgShared]);

  const effectiveDomain = domain === '__new__' ? slugifyDomain(newDomainInput) : domain;
  const domainValid = DOMAIN_REGEX.test(effectiveDomain);

  const handleSave = async () => {
    if (!body.trim()) {
      setError(t('memoryUi.errorContentRequired'));
      return;
    }
    if (!domainValid) {
      setError(t('memoryUi.errorPickDomain'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const tags = [`domain:${effectiveDomain}`, ...parseFreeFormTags(tagsInput)];
      if (target.mode === 'create') {
        await memoryApi.create({ content: body, tags, orgShared });
      } else {
        await memoryApi.update(target.item.id, {
          content: body,
          tags,
          // Only send orgShared when the user actually flipped it, so a
          // developer editing their own org-shared item doesn't trip the
          // admin gate when they didn't change the toggle.
          ...(orgShared !== wasOrgShared ? { orgShared } : {}),
        });
      }
      onSaved();
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError(t('memoryUi.errorEditOwnOnly'));
      } else {
        setError(e instanceof Error ? e.message : t('memoryUi.errorSaveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    try {
      await memoryApi.delete(target.item.id);
      setConfirmDeleteOpen(false);
      onSaved();
    } catch (e) {
      setConfirmDeleteOpen(false);
      setError(e instanceof Error ? e.message : t('memoryUi.errorDeleteFailed'));
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? t('memoryUi.editTitle') : t('memoryUi.newTitle')}</SheetTitle>
          <SheetDescription>
            {t('memoryUi.sheetDescriptionPrefix')} <code>public</code>{' '}
            {t('memoryUi.sheetDescriptionSuffix')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="domain">{t('memoryUi.domainLabel')}</Label>
            <select
              id="domain"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={!canMutate}
            >
              <option value="">{t('memoryUi.domainPickPlaceholder')}</option>
              {knownDomains
                .filter((d) => d !== 'untagged')
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              <option value="__new__">{t('memoryUi.domainNewOption')}</option>
            </select>
            {domain === '__new__' && (
              <Input
                placeholder={t('memoryUi.domainNewPlaceholder')}
                value={newDomainInput}
                onChange={(e) => setNewDomainInput(e.target.value)}
                disabled={!canMutate}
              />
            )}
            <p className="text-xs text-muted-foreground">{t('memoryUi.domainHelp')}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">{t('memoryUi.contentLabel')}</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder={t('memoryUi.contentPlaceholder')}
              disabled={!canMutate}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">{t('memoryUi.tagsLabel')}</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t('memoryUi.tagsPlaceholder')}
              disabled={!canMutate}
            />
            <p className="text-xs text-muted-foreground">
              {t('memoryUi.tagsHelpPrefix')} (<code>domain:</code>, <code>daily:</code>){' '}
              {t('memoryUi.tagsHelpSuffix')}
            </p>
          </div>

          {/* Org-share toggle is admin-only; hidden for developers and viewers
              unless the item is already shared (so an owner can un-share). */}
          {(isAdmin || wasOrgShared) && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="org-share-toggle" className="text-sm">
                  {t('memoryUi.orgShareLabel')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('memoryUi.orgShareHelpPart1')} <code>search_memory</code>.{' '}
                  {t('memoryUi.orgShareHelpPart2')} <code>MemoryShare(targetType=ORG)</code>{' '}
                  {t('memoryUi.orgShareHelpPart3')} <code>share_memory</code>.
                </p>
              </div>
              <Switch
                id="org-share-toggle"
                checked={orgShared}
                onCheckedChange={setOrgShared}
                disabled={!canToggleOrgShare}
              />
            </div>
          )}

          {isEdit && (
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              <Badge variant="outline">
                {t('memoryUi.createdAt', { date: new Date(item!.createdAt).toLocaleString() })}
              </Badge>
              <Badge variant="outline">
                {t('memoryUi.updatedAt', { date: new Date(item!.updatedAt).toLocaleString() })}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          {isEdit && canMutate ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={saving}
            >
              <Trash2 className="mr-1 size-4" />
              {t('memoryUi.delete')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              {t('memoryUi.close')}
            </Button>
            {canMutate && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Save className="mr-1 size-4" />
                )}
                {t('memoryUi.save')}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('memoryUi.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('memoryUi.deleteConfirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('memoryUi.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
            >
              {t('memoryUi.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
