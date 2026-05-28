'use client';

import { FilePlus, FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';

interface WorkspaceToolbarProps {
  readonly entryCount: number;
  readonly onNewFile: () => void;
  readonly onNewFolder: () => void;
  readonly onUpload: () => void;
}

export function WorkspaceToolbar({
  entryCount,
  onNewFile,
  onNewFolder,
  onUpload,
}: WorkspaceToolbarProps) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onNewFile}>
        <FilePlus className="mr-1.5 size-4" />
        {t('workspace.newFile')}
      </Button>
      <Button variant="outline" size="sm" onClick={onNewFolder}>
        <FolderPlus className="mr-1.5 size-4" />
        {t('workspace.newFolder')}
      </Button>
      <Button variant="outline" size="sm" onClick={onUpload}>
        <Upload className="mr-1.5 size-4" />
        {t('workspace.upload')}
      </Button>
      <div className="flex-1" />
      <span className="text-xs text-muted-foreground">
        {entryCount === 1
          ? t('workspace.itemCountOne', { count: entryCount })
          : t('workspace.itemCountOther', { count: entryCount })}
      </span>
    </div>
  );
}
