'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GalleryVerticalEnd, Loader2, MailCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/language-toggle';
import { apiFetch, ApiError } from '@/lib/api';
import { rememberAccessToken } from '@/lib/auth';
import { useLanguage } from '@/i18n';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') ?? '';
  const { t } = useLanguage();

  const [digits, setDigits]       = useState<string[]>(Array(6).fill(''));
  const [error, setError]         = useState('');
  const [isVerifying, setVerifying] = useState(false);
  const [isResending, setResending] = useState(false);
  const [cooldown, setCooldown]   = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => { setCooldown((c) => Math.max(0, c - 1)); }, 1000);
    return () => { clearInterval(t); };
  }, [cooldown]);

  // Focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const code = digits.join('');

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? '';
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerify() {
    if (code.length < 6) { setError(t('verify.enterAll')); return; }
    setError('');
    setVerifying(true);
    try {
      const res = await apiFetch<{ accessToken: string; paymentToken: string }>(
        '/auth/verify-email',
        { method: 'POST', body: JSON.stringify({ email, code }) },
      );

      // Store JWT in memory
      rememberAccessToken(res.accessToken);

      // Kick off droplet provisioning with the stored plan
      const plan           = sessionStorage.getItem('droplet_plan') ?? '';
      const region         = sessionStorage.getItem('droplet_region') ?? 'sgp1';
      const ssh            = sessionStorage.getItem('droplet_ssh') ?? '';
      const servicePackage = sessionStorage.getItem('service_package') ?? undefined;
      const serviceField   = sessionStorage.getItem('service_field') ?? undefined;

      if (plan && ssh) {
        apiFetch('/droplets', {
          method: 'POST',
          accessToken: res.accessToken,
          body: JSON.stringify({ size: plan, region, sshPublicKey: ssh, servicePackage, serviceField }),
        }).catch(() => { /* provisioning failure won't block flow */ });
      }

      // AI Agent Training path: the viewer account is now verified — send a
      // welcome email inviting the user to sign in. Fire-and-forget so an
      // email hiccup never blocks the flow.
      if (sessionStorage.getItem('sub_type') === 'subscribe') {
        apiFetch('/auth/send-welcome', {
          method: 'POST',
          body: JSON.stringify({ email }),
        }).catch(() => { /* email failure won't block flow */ });
      }

      // Navigate to payment page with the signed token
      router.push(`/payment?token=${res.paymentToken}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('verify.failed'));
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      await apiFetch('/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setCooldown(60);
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('verify.resendFailed'));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="brand-clawix relative flex min-h-svh items-center justify-center bg-background px-4">
      <LanguageToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-md">
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

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {/* Icon + heading */}
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="size-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('verify.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t('verify.sentTo')}</p>
              <p className="text-sm font-medium">{email || t('verify.yourEmail')}</p>
            </div>
          </div>

          {/* 6-digit OTP input */}
          <div className="mb-6 flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => { handleDigitChange(i, e.target.value); }}
                onKeyDown={(e) => { handleKeyDown(i, e); }}
                disabled={isVerifying}
                className={`size-12 rounded-lg border text-center text-xl font-bold
                  bg-background transition-all outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                  disabled:opacity-50
                  ${error ? 'border-destructive' : 'border-input'}`}
              />
            ))}
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          {/* Verify button */}
          <Button
            className="w-full"
            size="lg"
            disabled={code.length < 6 || isVerifying}
            onClick={() => { void handleVerify(); }}
          >
            {isVerifying && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('verify.verify')}
          </Button>

          {/* Resend */}
          <div className="mt-5 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>{t('verify.didntReceive')}</span>
            <button
              type="button"
              disabled={cooldown > 0 || isResending}
              onClick={() => { void handleResend(); }}
              className="flex items-center gap-1 font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50 hover:underline"
            >
              {isResending
                ? <><Loader2 className="size-3 animate-spin" /> {t('verify.sending')}</>
                : cooldown > 0
                  ? t('verify.resendIn', { seconds: cooldown })
                  : <><RefreshCw className="size-3" /> {t('verify.resend')}</>}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('verify.wrongEmail')}{' '}
            <a href="/signup" className="underline underline-offset-4 hover:text-primary">
              {t('verify.goBack')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
