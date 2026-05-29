'use client';

import { Shield, Cog, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface Accent {
  icon: string;
  glow: string;
}

// Same gradient-accent palette used by the ecommerce feature grid, so the
// landing pillars read as the same product surface.
const accents = {
  sky: { icon: 'from-sky-500 to-blue-600', glow: 'from-sky-500/15 to-blue-600/10' },
  violet: { icon: 'from-violet-500 to-purple-600', glow: 'from-violet-500/15 to-purple-600/10' },
  emerald: { icon: 'from-emerald-400 to-teal-600', glow: 'from-emerald-400/15 to-teal-600/10' },
} satisfies Record<string, Accent>;

const pillars = [
  { key: 'control', icon: Shield, accent: accents.sky },
  { key: 'execution', icon: Cog, accent: accents.violet },
  { key: 'ownership', icon: Server, accent: accents.emerald },
] as const;

// Each pillar has exactly three features in the dictionary; we iterate a fixed
// count because the i18n resolver returns strings only (arrays are accessed by
// numeric path segment, e.g. `home.pillars.control.features.0`).
const FEATURE_INDICES = [0, 1, 2] as const;

export function CorePillarsSection() {
  const { t } = useLanguage();

  return (
    <section className="border-t bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('home.pillars.title')}
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="group animate-fade-up relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-black/5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* hover glow */}
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    pillar.accent.glow,
                  )}
                />
                {/* top accent line */}
                <div
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    pillar.accent.icon,
                  )}
                />
                <div className="relative z-10 flex flex-col gap-3">
                  <div
                    className={cn(
                      'flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110',
                      pillar.accent.icon,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(`home.pillars.${pillar.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`home.pillars.${pillar.key}.description`)}
                  </p>
                  <ul className="mt-1 space-y-2">
                    {FEATURE_INDICES.map((featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span
                          className={cn(
                            'size-1.5 rounded-full bg-gradient-to-br',
                            pillar.accent.icon,
                          )}
                        />
                        {t(`home.pillars.${pillar.key}.features.${featureIndex}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
