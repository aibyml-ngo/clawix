'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';

// The dictionary exposes exactly three highlights; the i18n resolver returns
// strings only, so we index the array by numeric path segment
// (e.g. `home.enterprise.highlights.0`) over a fixed count.
const HIGHLIGHT_INDICES = [0, 1, 2] as const;

export function EnterpriseSection() {
  const { t } = useLanguage();

  return (
    <section className="border-t bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.enterprise.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.enterprise.description')}
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {HIGHLIGHT_INDICES.map((index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                {t(`home.enterprise.highlights.${index}`)}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/signup">{t('home.enterprise.cta')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
