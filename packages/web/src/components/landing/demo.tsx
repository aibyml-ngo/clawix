'use client';

import { Play } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';

export function DemoSection() {
  const { t } = useLanguage();

  return (
    <section id="demo" className="border-t bg-muted/40 py-20 sm:py-24">
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
          <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                asChild
                size="lg"
                className="h-16 w-16 rounded-full bg-white/90 text-primary hover:bg-white"
              >
                <a
                  href="https://youtu.be/NsH4Mn6znhA?si=lHmxZ2cmUXrFMa04"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="h-8 w-8" />
                  <span className="sr-only">{t('home.demo.cta')}</span>
                </a>
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 text-sm text-white/80">
              {t('home.demo.caption')}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <a
                href="https://youtu.be/NsH4Mn6znhA?si=lHmxZ2cmUXrFMa04"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.demo.cta')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
