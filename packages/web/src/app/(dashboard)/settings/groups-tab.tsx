'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MoreHorizontal, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { authFetch } from '@/lib/auth';
import { useLanguage } from '@/i18n';
import { SuccessDialog } from '@/components/ui/success-dialog';
import { CreateGroupDialog, EditGroupDialog, MembersDialog } from './groups-dialogs';

// ------------------------------------------------------------------ //
//  Types (exported for use in dialogs)                                //
// ------------------------------------------------------------------ //

export interface ApiGroupMember {
  groupId: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
  user: { id: string; name: string; email: string };
}

export interface ApiGroup {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  createdAt: string;
  _count: { members: number };
  members: { role: string; user: { id: string; name: string; email: string } }[];
}

interface PaginatedGroups {
  data: ApiGroup[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ------------------------------------------------------------------ //
//  Helpers                                                            //
// ------------------------------------------------------------------ //

function getOwnerName(group: ApiGroup): string {
  const owner = group.members.find((m) => m.role === 'OWNER');
  return owner?.user.name ?? '\u2014';
}

function truncate(text: string | null, max: number): string {
  if (!text) return '\u2014';
  return text.length > max ? `${text.slice(0, max)}\u2026` : text;
}

// ------------------------------------------------------------------ //
//  Component                                                          //
// ------------------------------------------------------------------ //

export function GroupsTab() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<ApiGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<ApiGroup | null>(null);
  const [membersGroup, setMembersGroup] = useState<ApiGroup | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch<PaginatedGroups>('/admin/groups?limit=100');
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.errors.loadGroups'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  async function handleCreate(form: FormData) {
    setSaving(true);
    setError('');
    try {
      await authFetch('/admin/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          description: form.get('description') || undefined,
        }),
      });
      setCreateOpen(false);
      await fetchGroups();
      setSuccessMessage(t('groups.admin.createdMessage', { name: String(form.get('name') ?? '') }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.errors.createGroup'));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, form: FormData) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/groups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.get('name'),
          description: form.get('description') || null,
        }),
      });
      setEditGroup(null);
      await fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.errors.updateGroup'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/groups/${id}`, { method: 'DELETE' });
      setDeleteGroup(null);
      await fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.errors.deleteGroup'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('groups.admin.subtitle')}</p>
        <Button
          size="sm"
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          {t('groups.admin.addGroup')}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-md border bg-background/30 backdrop-blur-sm p-8 text-center text-sm text-muted-foreground">
          {t('groups.admin.empty')}
        </div>
      ) : (
        <div className="rounded-md border bg-background/30 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('groups.admin.colGroup')}</TableHead>
                <TableHead>{t('groups.admin.colDescription')}</TableHead>
                <TableHead>{t('groups.admin.colMembers')}</TableHead>
                <TableHead>{t('groups.admin.colOwner')}</TableHead>
                <TableHead>{t('groups.admin.colCreated')}</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      {group.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {truncate(group.description, 50)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t('groups.memberCount', { count: group._count.members })}
                    </Badge>
                  </TableCell>
                  <TableCell>{getOwnerName(group)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditGroup(group);
                          }}
                        >
                          {t('groups.admin.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setMembersGroup(group);
                          }}
                        >
                          {t('groups.admin.members')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => {
                            setDeleteGroup(group);
                          }}
                        >
                          {t('groups.admin.remove')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateGroupDialog
        key={createOpen ? 'create-open' : 'create-closed'}
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={saving}
        onSubmit={handleCreate}
      />

      <EditGroupDialog
        key={editGroup?.id ?? 'edit-none'}
        group={editGroup}
        onOpenChange={(open) => {
          if (!open) setEditGroup(null);
        }}
        saving={saving}
        onSubmit={handleUpdate}
      />

      <MembersDialog
        key={membersGroup?.id ?? 'members-none'}
        group={membersGroup}
        onOpenChange={(open) => {
          if (!open) setMembersGroup(null);
        }}
      />

      <AlertDialog
        open={deleteGroup !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteGroup(null);
        }}
      >
        {deleteGroup && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('groups.admin.removeTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('groups.admin.removeConfirmBefore')} <strong>{deleteGroup.name}</strong>
                {t('groups.admin.removeConfirmAfter')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('groups.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  void handleDelete(deleteGroup.id);
                }}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t('groups.admin.remove')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>

      <SuccessDialog
        open={successMessage !== ''}
        onOpenChange={(open) => {
          if (!open) setSuccessMessage('');
        }}
        title={t('groups.admin.createdTitle')}
        description={successMessage}
      />
    </>
  );
}
