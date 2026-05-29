'use client';

import Link from 'next/link';
import { GalleryVerticalEnd, Bot, Cpu, Server, Shield, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

export default function EcommercePage() {
  const { t } = useLanguage();
  return (
    <div className="brand-clawix flex min-h-svh flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="text-base font-semibold">{t('common.brand')}</span>
        </div>
        <nav className="flex items-center gap-2">
          <LanguageToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">{t('landing.nav.signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">{t('landing.nav.getStarted')}</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1 text-sm text-muted-foreground">
          <Server className="size-3.5" />
          {t('landing.hero.badge')}
        </div>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight leading-tight">
          {t('landing.hero.titleLead')}{' '}
          <span className="text-primary">{t('landing.hero.titleHighlight')}</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t('landing.hero.subtitle')}</p>
        <div className="flex items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">{t('landing.hero.ctaInstall')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signup">{t('landing.hero.ctaTraining')}</Link>
          </Button>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t bg-muted/40 px-8 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
            {t('landing.features.eyebrow')}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">{t('landing.features.heading')}</h2>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <FeatureCard
            className="lg:col-span-3"
            delay={0}
            accent={accents.sky}
            icon={<Server className="size-5" />}
            title={t('landing.features.card1.title')}
            description={t('landing.features.card1.desc')}
          />
          <FeatureCard
            className="lg:col-span-3"
            delay={80}
            accent={accents.violet}
            icon={<Cpu className="size-5" />}
            title={t('landing.features.card2.title')}
            description={t('landing.features.card2.desc')}
          />
          <FeatureCard
            className="lg:col-span-2"
            delay={160}
            accent={accents.amber}
            icon={<Bot className="size-5" />}
            title={t('landing.features.card3.title')}
            description={t('landing.features.card3.desc')}
          />
          <FeatureCard
            className="lg:col-span-2"
            delay={240}
            accent={accents.emerald}
            icon={<Shield className="size-5" />}
            title={t('landing.features.card4.title')}
            description={t('landing.features.card4.desc')}
          />
          <FeatureCard
            className="sm:col-span-2 lg:col-span-2"
            delay={320}
            accent={accents.rose}
            icon={<MonitorSmartphone className="size-5" />}
            title={t('landing.features.card5.title')}
            description={t('landing.features.card5.desc')}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-4 border-t px-6 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('landing.cta.heading')}</h2>
        <p className="text-muted-foreground">{t('landing.cta.subtitle')}</p>
        <Button size="lg" asChild>
          <Link href="/signup">{t('landing.cta.button')}</Link>
        </Button>
      </section>

      <footer className="border-t px-8 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t('landing.footer')}
      </footer>
    </div>
  );
}

interface Accent {
  icon: string;
  glow: string;
}

const accents = {
  sky: { icon: 'from-sky-500 to-blue-600', glow: 'from-sky-500/15 to-blue-600/10' },
  violet: { icon: 'from-violet-500 to-purple-600', glow: 'from-violet-500/15 to-purple-600/10' },
  amber: { icon: 'from-amber-400 to-orange-500', glow: 'from-amber-400/15 to-orange-500/10' },
  emerald: { icon: 'from-emerald-400 to-teal-600', glow: 'from-emerald-400/15 to-teal-600/10' },
  rose: { icon: 'from-rose-400 to-pink-600', glow: 'from-rose-400/15 to-pink-600/10' },
} satisfies Record<string, Accent>;

function FeatureCard({
  icon,
  title,
  description,
  accent,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: Accent;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        'group animate-fade-up relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* hover glow */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          accent.glow,
        )}
      />
      {/* top accent line */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          accent.icon,
        )}
      />
      <div className="relative z-10 flex flex-col gap-3">
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110',
            accent.icon,
          )}
        >
          {icon}
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
