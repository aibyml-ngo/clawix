'use client';

import { PoliciesTab } from '../policies-tab';
import { useLanguage } from '@/i18n';

export default function PoliciesPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settingsPages.policiesTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('settingsPages.policiesDesc')}</p>
      </div>
      <PoliciesTab />
    </div>
  );
}
