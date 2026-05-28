'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ChevronRight, Folder, Pencil } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { authFetch } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/format';
import { useLanguage } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { ImagePreview } from './image-preview';
import type { DirectoryListing, FileContent } from '@clawix/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Validation ---

const INVALID_NAME_PATTERN = /[/\\]/;
const MAX_NAME_LENGTH = 255;

type TFn = (key: string, params?: Record<string, string | number>) => string;

function validateName(name: string, t: TFn): string | null {
  if (name.length === 0) return t('workspace.errorNameRequired');
  if (name.length > MAX_NAME_LENGTH)
    return t('workspace.errorNameTooLong', { max: MAX_NAME_LENGTH });
  if (INVALID_NAME_PATTERN.test(name)) return t('workspace.errorNameSlashes');
  return null;
}

// --- CreateDialog ---

interface CreateDialogProps {
  readonly type: 'file' | 'directory';
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: (name: string) => void;
  readonly isLoading?: boolean;
}

export function CreateDialog({
  type,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CreateDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const error = name.length > 0 ? validateName(name, t) : null;
  const isFile = type === 'file';

  const handleConfirm = useCallback(() => {
    if (!validateName(name, t)) {
      onConfirm(name);
      setName('');
    }
  }, [name, onConfirm, t]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) setName('');
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isFile ? t('workspace.createFileTitle') : t('workspace.createFolderTitle')}
          </DialogTitle>
          <DialogDescription>
            {isFile ? t('workspace.createFileDescription') : t('workspace.createFolderDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="entry-name">{t('workspace.nameLabel')}</Label>
          <Input
            id="entry-name"
            placeholder={
              isFile
                ? t('workspace.fileNamePlaceholder', { example: 'index.ts' })
                : t('workspace.folderNamePlaceholder', { example: 'src' })
            }
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !error && name.length > 0) handleConfirm();
            }}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            {t('workspace.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!name || !!error || isLoading}>
            {isLoading ? t('workspace.creating') : t('workspace.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- DeleteDialog ---

interface DeleteDialogProps {
  readonly name: string;
  readonly isDirectory: boolean;
  readonly childCount?: number;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: () => void;
  readonly isLoading?: boolean;
}

export function DeleteDialog({
  name,
  isDirectory,
  childCount,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteDialogProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('workspace.deleteTitle', { name })}</AlertDialogTitle>
          <AlertDialogDescription>
            {isDirectory
              ? childCount !== undefined
                ? childCount === 1
                  ? t('workspace.deleteFolderCountOne', { count: childCount })
                  : t('workspace.deleteFolderCountOther', { count: childCount })
                : t('workspace.deleteFolderDescription')
              : t('workspace.deleteCannotUndo')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('workspace.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('workspace.deleting') : t('workspace.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --- MoveDialog ---

interface MoveDialogProps {
  readonly name: string;
  readonly currentDir: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: (destination: string) => void;
  readonly isLoading?: boolean;
}

interface DirNode {
  readonly path: string;
  readonly name: string;
  children: DirNode[] | null; // null = not loaded
  expanded: boolean;
}

function updateNode(
  nodes: DirNode[],
  targetPath: string,
  updater: (node: DirNode) => DirNode,
): DirNode[] {
  return nodes.map((node) => {
    if (node.path === targetPath) {
      return updater(node);
    }
    if (node.children !== null) {
      return { ...node, children: updateNode(node.children, targetPath, updater) };
    }
    return node;
  });
}

async function fetchDirs(path: string): Promise<DirNode[]> {
  const encoded = encodeURIComponent(path);
  const listing = await authFetch<DirectoryListing>(`/api/v1/workspace/files?path=${encoded}`);
  return listing.entries
    .filter((e) => e.type === 'directory')
    .map((e) => ({
      path: e.path,
      name: e.name,
      children: null,
      expanded: false,
    }));
}

export function MoveDialog({
  name,
  currentDir,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: MoveDialogProps) {
  const { t } = useLanguage();
  const [roots, setRoots] = useState<DirNode[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load root directories whenever dialog opens
  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setFetchError(null);
    setRoots([]);

    fetchDirs('/')
      .then((dirs) => {
        setRoots(dirs);
      })
      .catch(() => {
        setFetchError(t('workspace.errorLoadDirectories'));
      });
  }, [open, t]);

  const handleToggle = useCallback(async (node: DirNode) => {
    const nextExpanded = !node.expanded;

    if (nextExpanded && node.children === null) {
      // Lazy-load children first, then expand
      try {
        const children = await fetchDirs(node.path);
        setRoots((prev) =>
          updateNode(prev, node.path, (n) => ({ ...n, children, expanded: true })),
        );
      } catch {
        // silently leave unexpanded on error
      }
    } else {
      setRoots((prev) => updateNode(prev, node.path, (n) => ({ ...n, expanded: nextExpanded })));
    }
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSelected(null);
        setFetchError(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleConfirm = useCallback(() => {
    if (selected !== null) {
      onConfirm(selected);
    }
  }, [selected, onConfirm]);

  function renderNode(node: DirNode, depth: number): React.ReactNode {
    const isCurrentDir = node.path === currentDir;
    const isSelected = selected === node.path;
    const hasChildren = node.children === null || node.children.length > 0;

    return (
      <div key={node.path}>
        <div
          className={cn(
            'flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm transition-colors',
            isSelected && 'bg-accent text-accent-foreground',
            !isSelected && !isCurrentDir && 'hover:bg-muted',
            isCurrentDir && 'cursor-not-allowed opacity-50',
          )}
          style={{ paddingLeft: `${0.5 + depth * 1.25}rem` }}
          onClick={() => {
            if (!isCurrentDir) setSelected(node.path);
          }}
        >
          <button
            type="button"
            aria-label={node.expanded ? t('workspace.collapse') : t('workspace.expand')}
            className={cn(
              'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded transition-transform',
              !hasChildren && 'invisible',
            )}
            onClick={(e) => {
              e.stopPropagation();
              void handleToggle(node);
            }}
          >
            <ChevronRight
              className={cn('h-3 w-3 transition-transform', node.expanded && 'rotate-90')}
            />
          </button>
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="truncate">{node.name}</span>
          {isCurrentDir && (
            <span className="ml-auto text-xs text-muted-foreground">{t('workspace.current')}</span>
          )}
        </div>
        {node.expanded && node.children !== null && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  }

  const rootIsCurrentDir = currentDir === '/';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('workspace.moveTitle', { name })}</DialogTitle>
          <DialogDescription>{t('workspace.moveDescription')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto rounded border border-border bg-background p-1">
          {/* Workspace root entry */}
          <div
            className={cn(
              'flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm transition-colors',
              selected === '/' && 'bg-accent text-accent-foreground',
              selected !== '/' && !rootIsCurrentDir && 'hover:bg-muted',
              rootIsCurrentDir && 'cursor-not-allowed opacity-50',
            )}
            onClick={() => {
              if (!rootIsCurrentDir) setSelected('/');
            }}
          >
            <span className="h-4 w-4 shrink-0" />
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate font-medium">{t('workspace.workspaceRoot')}</span>
            {rootIsCurrentDir && (
              <span className="ml-auto text-xs text-muted-foreground">{t('workspace.current')}</span>
            )}
          </div>

          {fetchError && <p className="px-2 py-2 text-xs text-destructive">{fetchError}</p>}

          {roots.map((node) => renderNode(node, 0))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            {t('workspace.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={selected === null || isLoading}>
            {isLoading ? t('workspace.moving') : t('workspace.move')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- DiscardDialog ---------- */

interface DiscardDialogProps {
  readonly filename: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onDiscard: () => void;
}

export function DiscardDialog({ filename, open, onOpenChange, onDiscard }: DiscardDialogProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('workspace.discardTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('workspace.discardPrefix')} <strong>{filename}</strong>
            {t('workspace.discardSuffix')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('workspace.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDiscard}
          >
            {t('workspace.discard')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------- ConflictDialog ---------- */

interface ConflictDialogProps {
  readonly filename: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onOverwrite: () => void;
  readonly onReload: () => void;
}

export function ConflictDialog({
  filename,
  open,
  onOpenChange,
  onOverwrite,
  onReload,
}: ConflictDialogProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            {t('workspace.conflictTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{filename}</strong>
            {t('workspace.conflictDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('workspace.cancel')}</AlertDialogCancel>
          <Button variant="outline" onClick={onReload}>
            {t('workspace.reloadFile')}
          </Button>
          <AlertDialogAction
            className="bg-amber-600 text-white hover:bg-amber-700"
            onClick={onOverwrite}
          >
            {t('workspace.overwrite')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------- MermaidBlock ---------- */

function MermaidBlock({ code }: { code: string }) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
    });

    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;

    mermaid
      .render(id, code)
      .then(({ svg: renderedSvg }) => {
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('workspace.errorRenderDiagram'));
          setSvg(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, t]);

  if (error) {
    return (
      <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">{t('workspace.mermaidError')}</p>
        <pre className="mt-1 text-xs">{error}</pre>
      </div>
    );
  }

  if (svg) {
    return (
      <div
        ref={containerRef}
        className="my-4 flex justify-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return <div className="my-4 h-32 animate-pulse rounded bg-muted" />;
}

/* ---------- FullPreviewDialog ---------- */

interface FullPreviewDialogProps {
  readonly file: FileContent | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onEdit?: () => void;
}

export function FullPreviewDialog({ file, open, onOpenChange, onEdit }: FullPreviewDialogProps) {
  const { t } = useLanguage();
  if (!file) return null;

  const isMarkdown = file.type === 'markdown';
  const canEdit = ['text', 'code', 'markdown', 'json'].includes(file.type) && file.content !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogTitle className="sr-only">
          {t('workspace.previewTitle', { name: file.name })}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t('workspace.previewDescription', {
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size),
          })}
        </DialogDescription>
        {/* Header */}
        <div className="flex items-center gap-2 border-b py-4 pl-6 pr-14">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="truncate text-lg font-semibold">{file.name}</span>
            <Badge variant="secondary" className="shrink-0">
              {file.type}
            </Badge>
            <span className="shrink-0 text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  onOpenChange(false);
                  onEdit();
                }}
                title={t('workspace.editFile')}
              >
                <Pencil className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {file.content === null ? (
            file.type === 'image' && !file.truncated ? (
              <ImagePreview path={file.path} alt={file.name} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {file.truncated
                    ? t('workspace.tooLargeToPreview')
                    : t('workspace.binaryNotAvailable')}
                </p>
              </div>
            )
          ) : isMarkdown ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? '');
                    const lang = match?.[1];
                    const codeStr = String(children).replace(/\n$/, '');

                    if (lang === 'mermaid') {
                      return <MermaidBlock code={codeStr} />;
                    }

                    // Inline code vs block code
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <pre className="overflow-x-auto rounded-md bg-muted p-4">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  pre({ children }) {
                    // Return children directly to avoid double-wrapping
                    return <>{children}</>;
                  },
                }}
              >
                {file.content}
              </Markdown>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/90">
              {file.content}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
