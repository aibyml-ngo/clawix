'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/lib/auth';
import { useLanguage } from '@/i18n';

const NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function CreateDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setErr('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setErr('');
    if (!NAME_REGEX.test(name)) {
      setErr(t('skillsUi.errNameFormat'));
      return;
    }
    if (description.trim().length === 0) {
      setErr(t('skillsUi.errDescriptionRequired'));
      return;
    }
    setSaving(true);
    try {
      await authFetch('/api/v1/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      setName('');
      setDescription('');
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('skillsUi.errCreateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col">
        <DialogHeader>
          <DialogTitle>{t('skillsUi.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('skillsUi.createDescBefore')}{' '}
            <code>/skills/&lt;name&gt;/SKILL.md</code> {t('skillsUi.createDescAfter')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <Input
            placeholder={t('skillsUi.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder={t('skillsUi.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('skillsUi.cancel')}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {t('skillsUi.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditDialog({
  target,
  onClose,
  onSaved,
}: {
  target: { dirName: string; content: string } | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setContent(target?.content ?? '');
    setErr('');
  }, [target]);

  if (!target) return null;

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      await authFetch(`/api/v1/skills/${target.dirName}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('skillsUi.errSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] !w-[60vw] flex-col !max-w-none">
        <DialogHeader>
          <DialogTitle>{t('skillsUi.editTitle', { dirName: target.dirName })}</DialogTitle>
          <DialogDescription>{t('skillsUi.editDesc')}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-0 flex-1 resize-none overflow-auto font-mono text-sm"
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('skillsUi.cancel')}
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {t('skillsUi.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RenameDialog({
  target,
  onClose,
  onRenamed,
}: {
  target: { dirName: string } | null;
  onClose: () => void;
  onRenamed: () => void;
}) {
  const { t } = useLanguage();
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setNewName(target?.dirName ?? '');
    setErr('');
  }, [target]);

  if (!target) return null;

  const handleSubmit = async () => {
    setErr('');
    if (!NAME_REGEX.test(newName)) {
      setErr(t('skillsUi.errNameFormat'));
      return;
    }
    setSaving(true);
    try {
      await authFetch(`/api/v1/skills/${target.dirName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      onRenamed();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('skillsUi.errRenameFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('skillsUi.renameTitle')}</DialogTitle>
          <DialogDescription>
            {t('skillsUi.renameDescBefore')} <code>name:</code>{' '}
            {t('skillsUi.renameDescAfter')}
          </DialogDescription>
        </DialogHeader>
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('skillsUi.cancel')}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {t('skillsUi.rename')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Read-only preview that renders the SKILL.md as markdown. Opens when the
 * user clicks a skill card. Built-in skills show a "BUILTIN" badge; custom
 * skills can jump from here straight into Edit via the footer button.
 */
export function PreviewDialog({
  target,
  onClose,
  onEdit,
}: {
  target: { dirName: string; name: string; source: 'builtin' | 'custom'; content: string } | null;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const { t } = useLanguage();
  if (!target) return null;
  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] !w-[60vw] flex-col !max-w-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{target.name}</span>
            <Badge
              variant="outline"
              className={
                target.source === 'builtin'
                  ? 'border-sky-500/40 bg-sky-500/15 text-sky-400'
                  : 'border-primary/40 bg-primary/15 text-primary'
              }
            >
              {target.source === 'builtin'
                ? t('skillsUi.badgeBuiltin')
                : t('skillsUi.badgeCustom')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            <code className="rounded bg-foreground/5 px-1 font-mono text-xs">
              /skills/{target.dirName}/SKILL.md
            </code>
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert min-h-0 max-w-none flex-1 overflow-auto rounded-md border bg-muted/20 p-4 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-base prose-h2:text-sm prose-h3:text-sm prose-pre:overflow-x-auto prose-pre:rounded-md prose-pre:bg-muted prose-pre:p-3 prose-pre:text-xs prose-code:rounded prose-code:bg-foreground/5 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none [&_pre_code]:bg-transparent">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{target.content}</ReactMarkdown>
        </div>
        <DialogFooter>
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              {t('skillsUi.edit')}
            </Button>
          ) : null}
          <Button onClick={onClose}>{t('skillsUi.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({
  target,
  onClose,
  onDeleted,
}: {
  target: { dirName: string; name: string } | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!target) return null;

  const handleConfirm = async () => {
    setSaving(true);
    setErr('');
    try {
      await authFetch(`/api/v1/skills/${target.dirName}`, { method: 'DELETE' });
      onDeleted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('skillsUi.errDeleteFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('skillsUi.deleteTitle')}</DialogTitle>
          <DialogDescription>
            {t('skillsUi.deleteDescBefore')} <strong>{target.name}</strong>{' '}
            {t('skillsUi.deleteDescAfter')}
          </DialogDescription>
        </DialogHeader>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('skillsUi.cancel')}
          </Button>
          <Button variant="destructive" onClick={() => void handleConfirm()} disabled={saving}>
            {saving ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            {t('skillsUi.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
