'use client';

import Link from 'next/link';
import { GalleryVerticalEnd, ExternalLink } from 'lucide-react';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/i18n';

const PAGES = [
  {
    title: 'Landing Page',
    description: 'Public marketing page with hero, features, and CTAs.',
    href: '/',
    variants: [{ label: 'View', href: '/' }],
  },
  {
    title: 'Sign Up Page',
    description: 'Subscription type chooser, plan/SSH/services form, password with confirm.',
    href: '/signup',
    variants: [{ label: 'View', href: '/signup' }],
  },
  {
    title: 'Email Verification Page',
    description: '6-digit OTP input with auto-advance, paste, and resend cooldown.',
    href: '/verify-email?email=demo@example.com',
    variants: [{ label: 'View', href: '/verify-email?email=demo@example.com' }],
  },
  {
    title: 'Payment Gateway — Cloud Computer (Droplet)',
    description: 'Order summary showing dedicated droplet plan specs and monthly price.',
    href: '/payment?demo=droplet',
    variants: [{ label: 'View (droplet)', href: '/payment?demo=droplet' }],
  },
  {
    title: 'Payment Gateway — AI Agent Training with Clawix',
    description: 'Order summary for AI Agent Training with Clawix.',
    href: '/payment?demo=subscribe',
    variants: [{ label: 'View (subscribe)', href: '/payment?demo=subscribe' }],
  },
  {
    title: 'Payment Success — Cloud Computer (Droplet)',
    description: 'Final confirmation screen after payment: IP / SSH details on the way.',
    href: '/payment?demo=success-droplet',
    variants: [{ label: 'View', href: '/payment?demo=success-droplet' }],
  },
  {
    title: 'Payment Success — AI Agent Training with Clawix',
    description: 'Final confirmation screen after payment: access details on the way.',
    href: '/payment?demo=success-subscribe',
    variants: [{ label: 'View', href: '/payment?demo=success-subscribe' }],
  },
];

export default function PreviewPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-svh bg-muted/30 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 flex items-center gap-3">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-80"
            aria-label={t('common.brand')}
          >
            <GalleryVerticalEnd className="size-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t('preview.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('preview.subtitle')}</p>
          </div>
          <LanguageToggle />
        </div>

        {/* Page list */}
        <div className="flex flex-col gap-4">
          {PAGES.map((page) => (
            <div key={page.href}
              className="rounded-xl border bg-card p-5 shadow-sm flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{page.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {page.description}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {page.variants.map((v) => (
                  <Link
                    key={v.href}
                    href={v.href}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {v.label}
                    <ExternalLink className="size-3" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">{t('preview.note')}</p>
      </div>
    </div>
  );
}
