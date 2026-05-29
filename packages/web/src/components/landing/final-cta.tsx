'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';

export function FinalCtaSection() {
  const { t } = useLanguage();

  return (
    <section className="border-t bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.finalCta.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.finalCta.description')}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/ecommerce">
                {t('home.finalCta.ctaPrimary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="https://github.com/ClawixAI/clawix"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.finalCta.ctaCommunity')}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">{t('home.finalCta.ctaWorkshop')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
