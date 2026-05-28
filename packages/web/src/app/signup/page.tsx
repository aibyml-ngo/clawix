'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Eye, EyeOff, GalleryVerticalEnd, Loader2,
  ChevronDown, ChevronUp, Terminal, Copy, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageToggle } from '@/components/language-toggle';
import { ApiError, apiFetch } from '@/lib/api';
import { useLanguage } from '@/i18n';

// ── Plan catalogue (mirrors DigitalOcean Basic pricing) ─────────────────────
const PLANS = [
  { slug: 's-1vcpu-1gb',  mem: '1 GiB',  cpu: 1, ssd: '25 GiB',  xfer: '1,000 GiB',  hr: '$0.01042', mo: '$7'   },
  { slug: 's-1vcpu-2gb',  mem: '2 GiB',  cpu: 1, ssd: '50 GiB',  xfer: '2,000 GiB',  hr: '$0.02083', mo: '$14'  },
  { slug: 's-2vcpu-2gb',  mem: '2 GiB',  cpu: 2, ssd: '60 GiB',  xfer: '3,000 GiB',  hr: '$0.03125', mo: '$21'  },
  { slug: 's-2vcpu-4gb',  mem: '4 GiB',  cpu: 2, ssd: '80 GiB',  xfer: '4,000 GiB',  hr: '$0.04167', mo: '$28'  },
  { slug: 's-2vcpu-8gb',  mem: '8 GiB',  cpu: 2, ssd: '100 GiB', xfer: '5,000 GiB',  hr: '$0.06250', mo: '$42'  },
  { slug: 's-4vcpu-8gb',  mem: '8 GiB',  cpu: 4, ssd: '160 GiB', xfer: '5,000 GiB',  hr: '$0.08333', mo: '$56'  },
  { slug: 's-4vcpu-16gb', mem: '16 GiB', cpu: 4, ssd: '200 GiB', xfer: '8,000 GiB',  hr: '$0.12500', mo: '$84'  },
  { slug: 's-8vcpu-16gb', mem: '16 GiB', cpu: 8, ssd: '320 GiB', xfer: '6,000 GiB',  hr: '$0.16667', mo: '$112' },
  { slug: 's-8vcpu-32gb', mem: '32 GiB', cpu: 8, ssd: '400 GiB', xfer: '10,000 GiB', hr: '$0.25000', mo: '$168' },
] as const;

const REGIONS = [
  { value: 'sgp1', label: 'Singapore 1' },
  { value: 'nyc1', label: 'New York 1' },
  { value: 'nyc3', label: 'New York 3' },
  { value: 'sfo3', label: 'San Francisco 3' },
  { value: 'lon1', label: 'London 1' },
  { value: 'fra1', label: 'Frankfurt 1' },
  { value: 'ams3', label: 'Amsterdam 3' },
  { value: 'tor1', label: 'Toronto 1' },
  { value: 'blr1', label: 'Bangalore 1' },
  { value: 'syd1', label: 'Sydney 1' },
] as const;

// ── Service packages ─────────────────────────────────────────────────────────
// `value` is the stable key persisted to sessionStorage / used in validation;
// `labelKey` is the i18n path for display only.
const SERVICE_PACKAGES = [
  { value: 'Install Generic AI Assistant only', labelKey: 'signup.packages.generic' },
  { value: 'Install + Field Setup', labelKey: 'signup.packages.fieldSetup' },
] as const;

const SERVICE_FIELDS = [
  { value: 'Accounting', labelKey: 'signup.fields.accounting' },
  { value: 'Building Services', labelKey: 'signup.fields.building' },
  { value: 'Church Services', labelKey: 'signup.fields.church' },
  { value: 'Financial Services', labelKey: 'signup.fields.financial' },
  { value: 'Legal Services', labelKey: 'signup.fields.legal' },
  { value: 'Marketing', labelKey: 'signup.fields.marketing' },
  { value: 'Media Design', labelKey: 'signup.fields.media' },
  { value: 'NGO Social Services', labelKey: 'signup.fields.ngo' },
] as const;

// ── Computer types (purchase a Clawix-installed machine) ─────────────────────
const COMPUTER_TYPES = [
  { value: 'Apple Mini P6 Standard with Clawix', labelKey: 'signup.computers.appleMini' },
  {
    value: 'Single Board Computer with Ram > 16G + 512G Storage with Clawix',
    labelKey: 'signup.computers.sbc',
  },
] as const;

// ── SSH key guide ────────────────────────────────────────────────────────────
const SSH_STEPS = [
  {
    os: 'Mac / Linux',
    commands: [
      '# 1. Check if you already have a key',
      'cat ~/.ssh/id_ed25519.pub',
      '',
      '# 2. If not, generate one',
      'ssh-keygen -t ed25519 -C "you@example.com"',
      '',
      '# 3. Copy the public key',
      'cat ~/.ssh/id_ed25519.pub',
    ],
  },
  {
    os: 'Windows (PowerShell)',
    commands: [
      '# 1. Check if you already have a key',
      'Get-Content ~/.ssh/id_ed25519.pub',
      '',
      '# 2. If not, generate one',
      'ssh-keygen -t ed25519 -C "you@example.com"',
      '',
      '# 3. Copy the public key',
      'Get-Content ~/.ssh/id_ed25519.pub',
    ],
  },
];

type SubscriptionType = '' | 'droplet' | 'subscribe' | 'purchase';

// ── Component ────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Account
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [orgName, setOrgName] = useState('');

  // Subscription type — drives conditional sections
  const [subType, setSubType] = useState<SubscriptionType>('');

  // Cloud Computer fields (only relevant when subType === 'droplet')
  const [planSlug, setPlanSlug]   = useState('');
  const [region, setRegion]       = useState('sgp1');
  const [sshKey, setSshKey]       = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeOs, setActiveOs]   = useState(0);
  const [copied, setCopied]       = useState(false);

  // Services (only relevant when subType === 'droplet')
  const [servicePackage, setServicePackage] = useState('');
  const [serviceField, setServiceField]     = useState('');

  // Computer purchase (only relevant when subType === 'purchase')
  const [computerType, setComputerType] = useState('');

  // Password (shown once subType is chosen)
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);

  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDroplet   = subType === 'droplet';
  const isPurchase  = subType === 'purchase';
  const selectedPlan = PLANS.find((p) => p.slug === planSlug) ?? null;

  function handleSubTypeChange(val: string) {
    setSubType(val as SubscriptionType);
    // Reset droplet-specific fields when switching away
    if (val !== 'droplet') {
      setPlanSlug(''); setSshKey(''); setServicePackage(''); setServiceField('');
    }
    if (val !== 'purchase') { setComputerType(''); }
    setPassword(''); setConfirmPassword(''); setError('');
  }

  function copyCommand(text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 1800);
    });
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');

    if (!subType) { setError(t('signup.err.selectType')); return; }
    if (password.length < 8) { setError(t('signup.err.passwordLen')); return; }
    if (password !== confirmPassword) { setError(t('signup.err.passwordMatch')); return; }

    if (isDroplet) {
      if (!planSlug) { setError(t('signup.err.selectPlan')); return; }
      if (!sshKey.trim()) { setError(t('signup.err.sshRequired')); return; }
      if (!servicePackage) { setError(t('signup.err.selectPackage')); return; }
      if (servicePackage !== 'Install Generic AI Assistant only' && !serviceField) {
        setError(t('signup.err.selectField')); return;
      }
    }

    if (isPurchase && !computerType) {
      setError(t('signup.err.selectComputer')); return;
    }

    setIsLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, orgName: orgName.trim() || undefined }),
      });

      sessionStorage.setItem('sub_type', subType);
      if (isDroplet) {
        sessionStorage.setItem('droplet_plan', planSlug);
        sessionStorage.setItem('droplet_region', region);
        sessionStorage.setItem('droplet_ssh', sshKey.trim());
        sessionStorage.setItem('service_package', servicePackage);
        sessionStorage.setItem('service_field', serviceField);
      }
      if (isPurchase) {
        sessionStorage.setItem('computer_type', computerType);
      }

      await apiFetch('/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('signup.err.failed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh w-full">
      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-8 lg:p-10">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-sm font-medium">{t('common.brand')}</span>
          </div>
          <LanguageToggle />
        </div>

        <div className="mx-auto w-full max-w-[420px] py-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t('signup.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('signup.subtitle')}</p>
          </div>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-8">

            {/* ── Section 1: Account ──────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('signup.section.account')}
              </p>

              <div className="flex flex-col gap-3">
                <Label htmlFor="name">{t('signup.fullName')}</Label>
                <Input id="name" type="text" placeholder={t('signup.fullNamePlaceholder')}
                  value={name} onChange={(e) => { setName(e.target.value); }}
                  required disabled={isLoading} />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="orgName">
                  {t('signup.orgName')}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">{t('signup.orgNameHint')}</span>
                </Label>
                <Input id="orgName" type="text" placeholder={t('signup.orgNamePlaceholder')}
                  value={orgName} onChange={(e) => { setOrgName(e.target.value); }}
                  disabled={isLoading} />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="email">{t('signup.email')}</Label>
                <Input id="email" type="email" placeholder={t('signup.emailPlaceholder')}
                  value={email} onChange={(e) => { setEmail(e.target.value); }}
                  required disabled={isLoading} />
              </div>
            </section>

            {/* ── Section 2: Service plan ─────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Label>{t('signup.servicePlanLabel')}</Label>
                <Select value={subType} onValueChange={handleSubTypeChange} disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('signup.servicePlanPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="droplet">{t('signup.planDroplet')}</SelectItem>
                    <SelectItem value="subscribe">{t('signup.planTraining')}</SelectItem>
                    <SelectItem value="purchase">{t('signup.planPurchase')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* ── Section 3a: Computer type (purchase only) ────────────── */}
            {isPurchase && (
              <section className="flex flex-col gap-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('signup.section.computer')}
                </p>

                <div className="flex flex-col gap-3">
                  <Label>{t('signup.computerType')}</Label>
                  <Select value={computerType} onValueChange={setComputerType} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('signup.computerTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPUTER_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{t(c.labelKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>
            )}

            {/* ── Section 3: Cloud Computer plan (droplet only) ────────── */}
            {isDroplet && (
              <section className="flex flex-col gap-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('signup.section.dropletPlan')}
                </p>

                <div className="flex flex-col gap-3">
                  <Label>{t('signup.plan')}</Label>
                  <Select value={planSlug} onValueChange={setPlanSlug} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('signup.planPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((p) => (
                        <SelectItem key={p.slug} value={p.slug}>
                          <span className="font-medium">{p.mo}/mo</span>
                          <span className="ml-2 text-muted-foreground">
                            {p.mem} · {p.cpu} vCPU{p.cpu > 1 ? 's' : ''} · {p.ssd} SSD
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlan && (
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <SpecRow label={t('signup.specs.memory')}   value={selectedPlan.mem} />
                      <SpecRow label={t('signup.specs.vcpus')}    value={`${selectedPlan.cpu} vCPU${selectedPlan.cpu > 1 ? 's' : ''}`} />
                      <SpecRow label={t('signup.specs.ssd')}      value={selectedPlan.ssd} />
                      <SpecRow label={t('signup.specs.transfer')} value={selectedPlan.xfer} />
                      <SpecRow label={t('signup.specs.perHour')}  value={selectedPlan.hr} />
                      <SpecRow label={t('signup.specs.perMonth')} value={<span className="font-semibold text-primary">{selectedPlan.mo}</span>} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Label>{t('signup.region')}</Label>
                  <Select value={region} onValueChange={setRegion} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{t(`signup.regions.${r.value}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>
            )}

            {/* ── Section 4: SSH access (droplet only) ─────────────────── */}
            {isDroplet && (
              <section className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('signup.section.ssh')}
                </p>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="sshKey">{t('signup.sshKey')}</Label>
                  <Textarea
                    id="sshKey"
                    placeholder="ssh-ed25519 AAAAC3Nza… you@example.com"
                    value={sshKey}
                    onChange={(e) => { setSshKey(e.target.value); }}
                    disabled={isLoading}
                    className="min-h-[80px] font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('signup.sshKeyHintPrefix')} <code className="rounded bg-muted px-1">~/.ssh/id_ed25519.pub</code> (or id_rsa.pub) {t('signup.sshKeyHintSuffix')}
                  </p>
                </div>

                {/* Collapsible guide */}
                <div className="rounded-lg border">
                  <button
                    type="button"
                    onClick={() => { setGuideOpen(!guideOpen); }}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="size-4 text-muted-foreground" />
                      {t('signup.sshGuideTitle')}
                    </span>
                    {guideOpen
                      ? <ChevronUp className="size-4 text-muted-foreground" />
                      : <ChevronDown className="size-4 text-muted-foreground" />}
                  </button>

                  {guideOpen && (
                    <div className="border-t px-4 py-4 flex flex-col gap-4">
                      <div className="flex gap-2">
                        {SSH_STEPS.map((s, i) => (
                          <button
                            key={s.os}
                            type="button"
                            onClick={() => { setActiveOs(i); }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                              activeOs === i
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {s.os}
                          </button>
                        ))}
                      </div>

                      <div className="relative rounded-md bg-neutral-900 p-4">
                        <button
                          type="button"
                          onClick={() => { copyCommand(SSH_STEPS[activeOs]!.commands.join('\n')); }}
                          className="absolute right-3 top-3 flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          {copied ? t('signup.sshGuideCopied') : t('signup.sshGuideCopy')}
                        </button>
                        <pre className="overflow-x-auto text-xs leading-5 text-neutral-200">
                          {SSH_STEPS[activeOs]!.commands.map((line, i) => (
                            <div key={i} className={line.startsWith('#') ? 'text-neutral-500' : ''}>
                              {line || ' '}
                            </div>
                          ))}
                        </pre>
                      </div>

                      <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-decimal pl-4">
                        <li>{t('signup.sshStep1')}</li>
                        <li>
                          {t('signup.sshStep2Prefix')} <code className="rounded bg-muted px-1">ssh-ed25519</code> {t('signup.sshStep2Mid')}{' '}
                          <code className="rounded bg-muted px-1">ssh-rsa</code> {t('signup.sshStep2Suffix')}
                        </li>
                        <li>{t('signup.sshStep3')}</li>
                        <li>
                          {t('signup.sshStep4Prefix')}{' '}
                          <code className="rounded bg-muted px-1">ssh root@&lt;your-ip&gt;</code>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Section 5: Services (droplet only) ───────────────────── */}
            {isDroplet && (
              <section className="flex flex-col gap-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('signup.section.services')}
                </p>

                <div className="flex flex-col gap-3">
                  <Label>{t('signup.servicePackage')}</Label>
                  <Select value={servicePackage} onValueChange={(v) => { setServicePackage(v); setServiceField(''); }} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('signup.servicePackagePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_PACKAGES.map((pkg) => (
                        <SelectItem key={pkg.value} value={pkg.value}>{t(pkg.labelKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {servicePackage && servicePackage !== 'Install Generic AI Assistant only' && (
                  <div className="flex flex-col gap-3">
                    <Label>{t('signup.field')}</Label>
                    <Select value={serviceField} onValueChange={setServiceField} disabled={isLoading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('signup.fieldPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{t(f.labelKey)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </section>
            )}

            {/* ── Section 6: Password (shown once subscription type chosen) */}
            {subType && (
              <section className="flex flex-col gap-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('signup.section.password')}
                </p>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="password">{t('signup.passwordLabel')}</Label>
                  <div className="relative">
                    <Input id="password" type={showPw ? 'text' : 'password'}
                      placeholder={t('signup.passwordPlaceholder')}
                      value={password} onChange={(e) => { setPassword(e.target.value); }}
                      required disabled={isLoading} className="pr-10" />
                    <button type="button" tabIndex={-1}
                      onClick={() => { setShowPw(!showPw); }}
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPw ? 'text' : 'password'}
                      placeholder={t('signup.confirmPasswordPlaceholder')}
                      value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); }}
                      required disabled={isLoading} className={`pr-10 ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-destructive focus-visible:ring-destructive'
                          : confirmPassword && confirmPassword === password
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : ''
                      }`} />
                    <button type="button" tabIndex={-1}
                      onClick={() => { setShowConfirmPw(!showConfirmPw); }}
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground hover:text-foreground">
                      {showConfirmPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-destructive">{t('signup.passwordsNoMatch')}</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-xs text-green-600">{t('signup.passwordsMatch')}</p>
                  )}
                </div>
              </section>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !subType}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isDroplet
                ? t('signup.submitDroplet')
                : subType === 'subscribe'
                  ? t('signup.submitTraining')
                  : subType === 'purchase'
                    ? t('signup.submitPurchase')
                    : t('signup.submitDefault')}
            </Button>

            {!isDroplet && (
              <p className="text-center text-sm text-muted-foreground">
                {t('signup.haveAccount')}{' '}
                <a href="/login" className="font-medium underline underline-offset-4 hover:text-primary">
                  {t('signup.signIn')}
                </a>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="relative hidden flex-1 bg-neutral-100 lg:block">
        <Image src="/images/login-bg.png" alt="" fill sizes="50vw"
          className="object-cover opacity-50" priority />
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </>
  );
}
