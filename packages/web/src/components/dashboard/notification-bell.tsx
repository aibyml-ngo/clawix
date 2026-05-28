'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { groupsApi } from '@/lib/api/groups';
import { notificationsApi, type Notification } from '@/lib/api/notifications';
import { useLanguage } from '@/i18n';
import { useNotificationsStream } from './use-notifications-stream';

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { items: list, unreadCount } = await notificationsApi.list();
      setItems(list);
      setUnread(unreadCount);
    } catch {
      // Bell is supplementary — silent fail keeps the header clean.
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  // Real-time push: prepend the row, bump unread, and surface a toast that
  // doubles as a quick-action panel for GROUP_INVITE rows.
  useNotificationsStream({
    onNotification: (n) => {
      setItems((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev;
        return [n, ...prev];
      });
      setUnread((u) => u + 1);

      if (n.type === 'PRIMARY_AGENT_ASSIGNED') {
        const name = n.payload.agentName ?? t('bell.aNewPrimaryAgent');
        toast.success(t('bell.primaryAgentUpdated'), {
          description: t('bell.primaryAgentDesc', { name }),
          duration: 8000,
        });
        return;
      }

      if (n.type === 'GROUP_INVITE_RESPONSE') {
        const who = n.payload.responderName ?? n.payload.responderEmail ?? t('bell.aMember');
        const groupName = n.payload.groupName ?? t('bell.yourGroup');
        const accepted = n.payload.response === 'accepted';
        const message = accepted
          ? t('bell.inviteAcceptedMsg', { who, group: groupName })
          : t('bell.inviteRejectedMsg', { who, group: groupName });
        if (accepted) toast.success(message);
        else toast(message);
        // Surfaces (Sent invites tab) listen for this so they can reload.
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('clawix:invite-responded'));
        }
        return;
      }

      if (n.type === 'GROUP_INVITE' && n.payload.inviteId) {
        const groupName = n.payload.groupName ?? t('bell.aGroup');
        const inviteId = n.payload.inviteId;
        toast.message(t('bell.newInviteTitle', { group: groupName }), {
          description: t('bell.newInviteDesc'),
          duration: 10_000,
          action: {
            label: t('bell.accept'),
            onClick: () => {
              void groupsApi.acceptInvite(inviteId).then(async () => {
                await notificationsApi.markRead(n.id);
                setItems((prev) => prev.filter((x) => x.id !== n.id));
                toast.success(t('bell.joined', { group: groupName }));
                await refresh();
              });
            },
          },
          cancel: {
            label: t('bell.reject'),
            onClick: () => {
              void groupsApi.rejectInvite(inviteId).then(async () => {
                await notificationsApi.markRead(n.id);
                setItems((prev) => prev.filter((x) => x.id !== n.id));
                await refresh();
              });
            },
          },
        });
      } else {
        toast.message(t('bell.newNotification'), {
          description: n.type,
        });
      }
    },
  });

  const dismiss = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const handleAccept = async (n: Notification) => {
    if (!n.payload.inviteId) return;
    setBusyId(n.id);
    const groupName = n.payload.groupName ?? t('bell.theGroup');
    try {
      await groupsApi.acceptInvite(n.payload.inviteId);
      await notificationsApi.markRead(n.id);
      dismiss(n.id);
      toast.success(t('bell.joined', { group: groupName }));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('bell.failedAccept'));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (n: Notification) => {
    if (!n.payload.inviteId) return;
    setBusyId(n.id);
    const groupName = n.payload.groupName ?? t('bell.theGroup');
    try {
      await groupsApi.rejectInvite(n.payload.inviteId);
      await notificationsApi.markRead(n.id);
      dismiss(n.id);
      toast(t('bell.declinedInvite', { group: groupName }));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('bell.failedReject'));
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      await notificationsApi.markAllRead();
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-[1rem] rounded-full bg-red-600 px-1 text-[10px] text-white border-red-700 hover:bg-red-600"
            >
              {unread > 99 ? '99+' : unread}
            </Badge>
          ) : null}
          <span className="sr-only">{t('bell.notifications')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // data-bell-popover hooks a fade-only keyframe defined in
        // globals.css that overrides the default zoom + slide.
        data-bell-popover=""
        className="w-96 p-0"
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">{t('bell.notifications')}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={loading || unread === 0}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="h-3 w-3" />
            )}
            <span className="ml-1 text-xs">{t('bell.markAllRead')}</span>
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('bell.allCaughtUp')}
            </div>
          ) : (
            items.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                busy={busyId === n.id}
                onAccept={() => handleAccept(n)}
                onReject={() => handleReject(n)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  busy,
  onAccept,
  onReject,
}: {
  notification: Notification;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { t } = useLanguage();
  if (notification.type === 'GROUP_INVITE') {
    const groupName = notification.payload.groupName ?? t('bell.aGroup');
    return (
      <div
        className={`flex flex-col gap-2 border-b px-3 py-3 text-sm last:border-b-0 ${
          notification.isRead ? 'opacity-60' : ''
        }`}
      >
        <div className="font-medium">{t('bell.inviteTo', { group: groupName })}</div>
        <div className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAccept} disabled={busy}>
            <Check className="mr-1 h-3 w-3" />
            {t('bell.accept')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onReject} disabled={busy}>
            {t('bell.reject')}
          </Button>
        </div>
      </div>
    );
  }

  if (notification.type === 'GROUP_INVITE_RESPONSE') {
    const who =
      notification.payload.responderName ?? notification.payload.responderEmail ?? t('bell.aMember');
    const groupName = notification.payload.groupName ?? t('bell.yourGroup');
    const accepted = notification.payload.response === 'accepted';
    return (
      <div
        className={`border-b px-3 py-3 text-sm last:border-b-0 ${
          notification.isRead ? 'opacity-60' : ''
        }`}
      >
        <div className="font-medium">
          {who}{' '}
          <span className={accepted ? 'text-emerald-400' : 'text-muted-foreground'}>
            {accepted ? t('bell.accepted') : t('bell.rejected')}
          </span>{' '}
          {t('bell.yourInvite')}
        </div>
        <div className="text-xs text-muted-foreground">{t('bell.toGroup', { group: groupName })}</div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </div>
      </div>
    );
  }

  if (notification.type === 'PRIMARY_AGENT_ASSIGNED') {
    const name = notification.payload.agentName ?? t('bell.aNewPrimaryAgent');
    return (
      <div
        className={`border-b px-3 py-3 text-sm last:border-b-0 ${
          notification.isRead ? 'opacity-60' : ''
        }`}
      >
        <div className="font-medium">{t('bell.primaryAgentUpdated')}</div>
        <div className="text-xs text-muted-foreground">{t('bell.primaryAgentDesc', { name })}</div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-b px-3 py-3 text-sm last:border-b-0 ${
        notification.isRead ? 'opacity-60' : ''
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {notification.type}
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(notification.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
