'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { LandingButton } from '@/components/landing/button';

export function DemoSection() {
  const { t } = useLanguage();

  return (
    <section id="demo" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.demo.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.demo.description')}
          </p>
        </div>

        <div className="mt-12">
          <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-clawix-primary to-clawix-accent shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <LandingButton
                size="lg"
                className="h-16 w-16 rounded-full bg-white/90 text-clawix-cta hover:bg-white"
              >
                <Play className="h-8 w-8" />
                <span className="sr-only">{t('home.demo.cta')}</span>
              </LandingButton>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-white/80">
              Demo video coming soon
            </div>
          </div>

          <div className="mt-8 text-center">
            <LandingButton asChild size="lg">
              <Link href="#demo">{t('home.demo.cta')}</Link>
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  );
}
