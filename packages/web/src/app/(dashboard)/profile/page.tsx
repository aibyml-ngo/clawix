'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Save, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authFetch } from '@/lib/auth';
import { useLanguage } from '@/i18n';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  policyId: string;
  isActive: boolean;
  telegramId: string | null;
  whatsappJid: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [whatsappJid, setWhatsappJid] = useState('');
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data, channels] = await Promise.all([
        authFetch<Profile>('/api/v1/me'),
        // Channel-id fields appear once the channel has been created in the
        // org, regardless of whether it's currently active.
        authFetch<{ data: { type: string }[] }>('/api/v1/channels').catch(() => ({ data: [] })),
      ]);
      setProfile(data);
      setName(data.name);
      setTelegramId(data.telegramId ?? '');
      setWhatsappJid(data.whatsappJid ?? '');
      const channelList = Array.isArray(channels.data) ? channels.data : [];
      setTelegramConfigured(channelList.some((ch) => ch.type.toLowerCase() === 'telegram'));
      setWhatsappConfigured(channelList.some((ch) => ch.type.toLowerCase() === 'whatsapp'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  async function handleSaveProfile(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await authFetch<Profile>('/api/v1/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          telegramId: telegramId || null,
          whatsappJid: whatsappJid || null,
        }),
      });
      setProfile(data);
      setSuccess(t('profile.updateSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('profile.pwMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('profile.pwTooShort'));
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authFetch('/api/v1/me/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess(t('profile.pwSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.pwError'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{t('profile.title')}</h1>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
            {t('profile.account')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t('profile.manage')}</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Account info (read-only) */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('profile.accountHeading')}</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('profile.email')}</span>
            <span className="font-medium">{profile?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('profile.role')}</span>
            <Badge
              variant={
                profile?.role === 'admin'
                  ? 'default'
                  : profile?.role === 'developer'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {profile?.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('profile.status')}</span>
            <Badge variant={profile?.isActive ? 'secondary' : 'outline'}>
              {profile?.isActive ? t('profile.active') : t('profile.inactive')}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('profile.memberSince')}</span>
            <span className="font-medium">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <form
        onSubmit={(e) => {
          void handleSaveProfile(e);
        }}
        className="rounded-lg border p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">{t('profile.editProfile')}</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">{t('profile.displayName')}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
            />
          </div>
          {telegramConfigured && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-telegram">{t('profile.telegramId')}</Label>
              <Input
                id="profile-telegram"
                value={telegramId}
                onChange={(e) => {
                  setTelegramId(e.target.value);
                }}
                placeholder={t('profile.telegramPlaceholder')}
                pattern="\d*"
              />
              <p className="text-xs text-muted-foreground">{t('profile.telegramHint')}</p>
            </div>
          )}
          {whatsappConfigured && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-whatsapp">{t('profile.whatsappJid')}</Label>
              <Input
                id="profile-whatsapp"
                value={whatsappJid}
                onChange={(e) => {
                  setWhatsappJid(e.target.value);
                }}
                placeholder="15551234567@s.whatsapp.net or 12345...@lid"
                pattern="\d+@(s\.whatsapp\.net|lid)"
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.waHint1')}{' '}
                <code className="font-mono">&lt;countrycode&gt;&lt;number&gt;@s.whatsapp.net</code>{' '}
                {t('profile.waHint2')}{' '}
                <code className="font-mono">15551234567@s.whatsapp.net</code>
                {t('profile.waHint3')}{' '}
                <code className="font-mono">&lt;id&gt;@lid</code> {t('profile.waHint4')}
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              {t('profile.saveChanges')}
            </Button>
          </div>
        </div>
      </form>

      {/* Change password */}
      <form
        onSubmit={(e) => {
          void handleChangePassword(e);
        }}
        className="rounded-lg border p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <KeyRound className="size-5" />
          {t('profile.changePassword')}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-password">{t('profile.currentPassword')}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
              }}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">{t('profile.newPassword')}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">{t('profile.confirmNewPassword')}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              minLength={8}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('profile.changePassword')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
