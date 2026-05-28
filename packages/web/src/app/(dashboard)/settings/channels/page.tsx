'use client';

import { ChannelsTab } from '../channels-tab';
import { useLanguage } from '@/i18n';

export default function ChannelsPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settingsPages.channelsTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('settingsPages.channelsDesc')}</p>
      </div>
      <ChannelsTab />
    </div>
  );
}
