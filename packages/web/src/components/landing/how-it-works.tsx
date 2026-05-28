'use client';

import { useLanguage } from '@/i18n';

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [0, 1, 2, 3].map((i) => ({
    number: t(`home.howItWorks.steps.${i}.number`),
    title: t(`home.howItWorks.steps.${i}.title`),
    description: t(`home.howItWorks.steps.${i}.description`),
  }));

  return (
    <section className="bg-clawix-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.howItWorks.title')}
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-clawix-accent-secondary via-clawix-cta to-clawix-accent-secondary md:block" />

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clawix-cta text-lg font-bold text-white shadow-lg">
                  {step.number}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
