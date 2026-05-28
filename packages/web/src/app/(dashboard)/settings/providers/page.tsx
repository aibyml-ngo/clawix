'use client';

import { ProvidersTab } from '../providers-tab';
import { useLanguage } from '@/i18n';

export default function ProvidersPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settingsPages.providersTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('settingsPages.providersDesc')}</p>
      </div>
      <ProvidersTab />
    </div>
  );
}
