'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, ChevronDown, GalleryVerticalEnd, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

// TODO: replace with the real Discord invite URL (e.g. https://discord.gg/xxxxxxx)
const DISCORD_URL = '#';

const menuItems = [
  { href: '#features', key: 'home.nav.products', external: false },
  { href: '#demo', key: 'home.nav.useCases', external: false },
  { href: '#github', key: 'home.nav.developers', external: false },
  { href: '#enterprise', key: 'home.nav.enterprise', external: false },
  { href: '#how-it-works', key: 'home.nav.learn', external: false },
  { href: DISCORD_URL, key: 'home.nav.discord', external: true },
] as const;

export function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <a href="https://clawix.aibyml.com" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </span>
          <span className="text-base font-semibold">{t('home.brand')}</span>
        </a>

        {/* Desktop nav — sections dropdown */}
        <nav className="hidden items-center gap-6 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex items-center gap-1 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-clawix-accent data-[state=open]:text-clawix-accent">
              {t('home.nav.menu')}
              <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.key} asChild>
                  <a
                    href={item.href}
                    className="cursor-pointer"
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <span className="flex-1">{t(item.key)}</span>
                    {item.external && <ArrowUpRight className="size-3.5 opacity-60" />}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <Button asChild variant="ghost">
            <Link href="/login">{t('home.nav.signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href="/ecommerce">{t('home.nav.getStarted')}</Link>
          </Button>
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
          {menuItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="flex items-center gap-1 py-2 text-base text-foreground/80 hover:text-clawix-accent"
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              {t(item.key)}
              {item.external && <ArrowUpRight className="size-3.5 opacity-60" />}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild variant="outline">
              <Link href="/login">{t('home.nav.signIn')}</Link>
            </Button>
            <Button asChild>
              <Link href="/ecommerce">{t('home.nav.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
