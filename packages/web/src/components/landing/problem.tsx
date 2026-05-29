'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n';

export function ProblemSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.problem.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.problem.description')}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Chaos side */}
          <div className="relative rounded-2xl border border-border bg-muted/50 p-8">
            <div className="absolute -top-4 left-6 rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-700">
              {t('home.problem.chaosLabel')}
            </div>
            <div className="mt-4 space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>{t(`home.problem.chaos.${i}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Structured side */}
          <div className="relative rounded-2xl border-2 border-green-500 bg-green-50 p-8">
            <div className="absolute -top-4 left-6 rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white">
              {t('home.problem.structuredLabel')}
            </div>
            <div className="mt-4 space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 text-gray-900">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>{t(`home.problem.structured.${i}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
