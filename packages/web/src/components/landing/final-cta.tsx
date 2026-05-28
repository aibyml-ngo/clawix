'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { LandingButton } from '@/components/landing/button';

export function FinalCtaSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-r from-clawix-accent to-clawix-cta py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('home.finalCta.title')}
          </h2>
          <p className="mt-4 text-lg text-white/80">
            {t('home.finalCta.description')}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LandingButton
              asChild
              size="lg"
              className="bg-white text-clawix-cta hover:bg-white/90"
            >
              <Link href="/ecommerce">
                {t('home.finalCta.ctaPrimary')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </LandingButton>
            <LandingButton
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <a
                href="https://github.com/ClawixAI/clawix"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('home.finalCta.ctaCommunity')}
              </a>
            </LandingButton>
            <LandingButton
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/signup">{t('home.finalCta.ctaWorkshop')}</Link>
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  );
}
