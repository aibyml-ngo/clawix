'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GalleryVerticalEnd, Menu, X } from 'lucide-react';
import { LandingButton } from './button';
import { LanguageToggle } from '@/components/language-toggle';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

const navItems = [
  { href: '#features', key: 'home.nav.features' },
  { href: '#how-it-works', key: 'home.nav.howItWorks' },
  { href: '#faq', key: 'home.nav.faq' },
] as const;

export function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-clawix-cta text-white">
            <GalleryVerticalEnd className="size-4" />
          </span>
          <span className="text-base font-bold text-clawix-primary">{t('home.brand')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-clawix-accent"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <LandingButton asChild variant="outline" size="sm">
            <Link href="/login">{t('home.nav.signIn')}</Link>
          </LandingButton>
          <LandingButton asChild size="sm">
            <Link href="/ecommerce">{t('home.nav.getStarted')}</Link>
          </LandingButton>
        </div>

        {/* Mobile toggle row */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t('home.nav.closeMenu') : t('home.nav.openMenu')}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn('md:hidden', mobileMenuOpen ? 'block' : 'hidden')}>
        <div className="space-y-1 border-t border-border px-4 pb-4 pt-2">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="block py-2 text-base text-foreground/80 hover:text-clawix-accent"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              {t(item.key)}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4">
            <LandingButton asChild variant="outline">
              <Link href="/login">{t('home.nav.signIn')}</Link>
            </LandingButton>
            <LandingButton asChild>
              <Link href="/ecommerce">{t('home.nav.getStarted')}</Link>
            </LandingButton>
          </div>
        </div>
      </div>
    </header>
  );
}
