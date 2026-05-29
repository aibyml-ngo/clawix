'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  GalleryVerticalEnd, Loader2, Lock, CreditCard,
  Server, CheckCircle2, ShieldCheck, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/language-toggle';
import { apiFetch, ApiError } from '@/lib/api';
import { useLanguage } from '@/i18n';

// ── Plan catalogue (same as signup page) ────────────────────────────────────
const PLANS: Record<string, { mem: string; cpu: number; ssd: string; mo: string; label: string }> = {
  's-1vcpu-1gb':  { mem: '1 GiB',  cpu: 1, ssd: '25 GiB',  mo: '$7',   label: '1 GiB · 1 vCPU — $7/mo'   },
  's-1vcpu-2gb':  { mem: '2 GiB',  cpu: 1, ssd: '50 GiB',  mo: '$14',  label: '2 GiB · 1 vCPU — $14/mo'  },
  's-2vcpu-2gb':  { mem: '2 GiB',  cpu: 2, ssd: '60 GiB',  mo: '$21',  label: '2 GiB · 2 vCPUs — $21/mo' },
  's-2vcpu-4gb':  { mem: '4 GiB',  cpu: 2, ssd: '80 GiB',  mo: '$28',  label: '4 GiB · 2 vCPUs — $28/mo' },
  's-2vcpu-8gb':  { mem: '8 GiB',  cpu: 2, ssd: '100 GiB', mo: '$42',  label: '8 GiB · 2 vCPUs — $42/mo' },
  's-4vcpu-8gb':  { mem: '8 GiB',  cpu: 4, ssd: '160 GiB', mo: '$56',  label: '8 GiB · 4 vCPUs — $56/mo' },
  's-4vcpu-16gb': { mem: '16 GiB', cpu: 4, ssd: '200 GiB', mo: '$84',  label: '16 GiB · 4 vCPUs — $84/mo'},
  's-8vcpu-16gb': { mem: '16 GiB', cpu: 8, ssd: '320 GiB', mo: '$112', label: '16 GiB · 8 vCPUs — $112/mo'},
  's-8vcpu-32gb': { mem: '32 GiB', cpu: 8, ssd: '400 GiB', mo: '$168', label: '32 GiB · 8 vCPUs — $168/mo'},
};

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentForm />
    </Suspense>
  );
}

function PaymentForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';
  // demo param: 'droplet' | 'subscribe' | 'success-droplet' | 'success-subscribe'
  const demo         = searchParams.get('demo') ?? '';
  const { t } = useLanguage();

  const [subType, setSubType]   = useState<'droplet' | 'subscribe' | ''>('');
  const [planSlug, setPlanSlug] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvc, setCvc]           = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setLoading] = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    if (demo) {
      // Demo mode: use query param to determine subType, ignore sessionStorage
      const demoSub = demo.replace('success-', '') as 'droplet' | 'subscribe';
      setSubType(demoSub);
      if (demoSub === 'droplet') setPlanSlug('s-2vcpu-4gb'); // sample plan
      if (demo.startsWith('success-')) setDone(true);
    } else {
      setSubType((sessionStorage.getItem('sub_type') ?? '') as 'droplet' | 'subscribe' | '');
      setPlanSlug(sessionStorage.getItem('droplet_plan') ?? '');
    }
  }, [demo]);

  const isDroplet = subType === 'droplet';
  const plan      = PLANS[planSlug];

  const planLabel = isDroplet
    ? (plan?.label ?? planSlug ?? 'Cloud Computer (Droplet)')
    : 'AI Agent Training with Clawix';

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handlePay(e: React.SyntheticEvent) {
    e.preventDefault();
    // In demo mode skip the API call and jump straight to success
    if (demo) { setDone(true); return; }
    if (!token) { setError(t('payment.errInvalidLink')); return; }
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentToken: token, planLabel }),
      });

      // Clear all stored signup data
      ['droplet_plan', 'droplet_region', 'droplet_ssh',
       'service_package', 'service_field', 'sub_type'].forEach((k) => {
        sessionStorage.removeItem(k);
      });

      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('payment.errFailed'));
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="brand-clawix relative flex min-h-svh items-center justify-center bg-background px-4">
        <LanguageToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <CheckCircle2 className="size-8" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">{t('payment.successTitle')}</h1>
          {isDroplet ? (
            <>
              <p className="mb-1 text-muted-foreground">{t('payment.successDroplet1')}</p>
              <p className="mb-8 text-sm text-muted-foreground">{t('payment.successDroplet2')}</p>
            </>
          ) : (
            <>
              <p className="mb-1 text-muted-foreground">{t('payment.successTraining1')}</p>
              <p className="mb-8 text-sm text-muted-foreground">{t('payment.successTraining2')}</p>
            </>
          )}
          <Button size="lg" onClick={() => { router.push('/conversations'); }}>
            {t('payment.goToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  // ── Payment form ───────────────────────────────────────────────────────────
  return (
    <div className="brand-clawix relative flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <LanguageToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
          aria-label={t('common.brand')}
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span className="text-base font-semibold">{t('common.brand')}</span>
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* ── Left: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-muted/40 p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('payment.orderSummary')}
              </p>

              {/* Product header */}
              <div className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {isDroplet ? <Server className="size-4" /> : <GraduationCap className="size-4" />}
                </div>
                <div>
                  <p className="font-semibold">
                    {isDroplet ? t('payment.productDroplet') : t('payment.productTraining')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isDroplet ? t('payment.productDropletSub') : t('payment.productTrainingSub')}
                  </p>
                </div>
              </div>

              {/* Spec card — droplet only */}
              {isDroplet && plan && (
                <div className="mb-4 rounded-lg border bg-background p-4 text-sm">
                  <div className="grid grid-cols-2 gap-y-2">
                    <span className="text-muted-foreground">{t('payment.specMemory')}</span><span>{plan.mem}</span>
                    <span className="text-muted-foreground">{t('payment.specVcpus')}</span><span>{plan.cpu}</span>
                    <span className="text-muted-foreground">{t('payment.specSsd')}</span><span>{plan.ssd}</span>
                  </div>
                </div>
              )}

              {/* Subscribe spec card */}
              {!isDroplet && (
                <div className="mb-4 rounded-lg border bg-background p-4 text-sm">
                  <div className="grid grid-cols-2 gap-y-2">
                    <span className="text-muted-foreground">{t('payment.trainingAssistant')}</span><span>{t('payment.trainingAssistantVal')}</span>
                    <span className="text-muted-foreground">{t('payment.trainingTraining')}</span><span>{t('payment.trainingTrainingVal')}</span>
                    <span className="text-muted-foreground">{t('payment.trainingAccess')}</span><span>{t('payment.trainingAccessVal')}</span>
                  </div>
                </div>
              )}

              {/* Price row */}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">{t('payment.monthlyTotal')}</span>
                <span className="text-2xl font-bold">
                  {isDroplet ? (plan?.mo ?? '—') : '—'}
                </span>
              </div>
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {t('payment.billedMonthly')}
              </p>

              {/* Trust badges */}
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-green-500" />
                  {t('payment.ssl')}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5 text-green-500" />
                  {t('payment.securePayment')}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-dashed bg-background p-3 text-center">
                <Badge variant="secondary" className="text-xs">{t('payment.gatewayTbd')}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{t('payment.gatewayNote')}</p>
              </div>
            </div>
          </div>

          {/* ── Right: Payment form ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <CreditCard className="size-5 text-muted-foreground" />
                <h2 className="font-semibold">{t('payment.paymentDetails')}</h2>
              </div>

              <form onSubmit={(e) => { void handlePay(e); }} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cardName">{t('payment.nameOnCard')}</Label>
                  <Input id="cardName" placeholder="Jane Smith"
                    value={cardName} onChange={(e) => { setCardName(e.target.value); }}
                    required disabled={isLoading} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
                  <div className="relative">
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); }}
                      required disabled={isLoading} className="pr-10 font-mono tracking-wider" />
                    <CreditCard className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="expiry">{t('payment.expiry')}</Label>
                    <Input id="expiry" placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => { setExpiry(formatExpiry(e.target.value)); }}
                      required disabled={isLoading} className="font-mono" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cvc">{t('payment.cvc')}</Label>
                    <Input id="cvc" placeholder="123" maxLength={4}
                      value={cvc}
                      onChange={(e) => { setCvc(e.target.value.replace(/\D/g, '').slice(0, 4)); }}
                      required disabled={isLoading} className="font-mono" />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
                  {isLoading
                    ? <><Loader2 className="mr-2 size-4 animate-spin" /> {t('payment.processing')}</>
                    : <><Lock className="mr-2 size-4" /> {t('payment.pay', { amount: isDroplet ? (plan?.mo ?? '') : '' })}</>}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t('payment.termsPrefix')}{' '}
                  {isDroplet ? t('payment.termsDroplet') : t('payment.termsTraining')}
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
