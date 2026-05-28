'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/i18n';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <LanguageToggle className="absolute right-4 top-4" />
      <div className="flex size-16 items-center justify-center rounded-full border border-muted bg-muted/50">
        <AlertTriangle className="size-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t('notFound.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('notFound.desc')}</p>
      </div>
      <Button asChild>
        <Link href="/conversations">{t('notFound.home')}</Link>
      </Button>
    </div>
  );
}
