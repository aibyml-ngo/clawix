'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/i18n';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <LanguageToggle className="absolute right-4 top-4" />
      <div className="flex size-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t('error.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('error.desc')}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          {t('error.retry')}
        </Button>
        <Button onClick={() => (window.location.href = '/conversations')}>{t('error.home')}</Button>
      </div>
    </div>
  );
}
