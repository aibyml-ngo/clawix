'use client';

import { useEffect, useState } from 'react';
import { FileWarning, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAccessToken } from '@/lib/auth';

interface ImagePreviewProps {
  readonly path: string;
  readonly alt: string;
  readonly className?: string;
}

export function ImagePreview({ path, alt, className }: ImagePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');
        const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
        const res = await fetch(
          `${apiBase}/api/v1/workspace/files/download?path=${encodeURIComponent(path)}&inline=true`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error(`Failed to load image (HTTP ${res.status})`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setUrl(objectUrl);
          setError(null);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load image');
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <FileWarning className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn('mx-auto block max-h-full max-w-full object-contain', className)}
    />
  );
}
