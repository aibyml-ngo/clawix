'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  EyeIcon,
  EyeOff,
  Loader2,
  Minus,
  MoreHorizontal,
  Plus,
  Shield,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { formString } from '@/lib/form';
import { useAnimeOnMount, staggerFadeUp, STAGGER } from '@/lib/anime';
import { DataPagination, type PaginationMeta } from '@/components/ui/data-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useLanguage } from '@/i18n';
import { GroupsTab } from '../groups-tab';

// ------------------------------------------------------------------ //
//  Types                                                              //
// ------------------------------------------------------------------ //

interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  policyId: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedUsers {
  data: ApiUser[];
  meta: PaginationMeta;
}

interface ApiPolicy {
  id: string;
  name: string;
  isActive: boolean;
}

interface PaginatedPolicies {
  data: ApiPolicy[];
  meta: PaginationMeta;
}

// ------------------------------------------------------------------ //
//  Helpers                                                            //
// ------------------------------------------------------------------ //

function roleVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'default' as const;
    case 'developer':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

// ------------------------------------------------------------------ //
//  Roles tab data (static — roles are enum-based)                     //
// ------------------------------------------------------------------ //

interface Permission {
  nameKey: string;
  admin: boolean;
  developer: boolean;
  viewer: boolean;
}

interface PermissionGroup {
  catKey: string;
  permissions: Permission[];
}

function PermissionIcon({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Check className="mx-auto size-4 text-green-500" aria-label="Allowed" />
  ) : (
    <Minus className="mx-auto size-4 text-muted-foreground/40" aria-label="Not allowed" />
  );
}

const permissionMatrix: PermissionGroup[] = [
  {
    catKey: 'users.cat.agents',
    permissions: [
      { nameKey: 'users.perm.viewAgentDefs', admin: true, developer: true, viewer: true },
      { nameKey: 'users.perm.createEditAgent', admin: true, developer: true, viewer: false },
      { nameKey: 'users.perm.deleteAgent', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.runAgent', admin: true, developer: true, viewer: false },
    ],
  },
  {
    catKey: 'users.cat.skills',
    permissions: [
      { nameKey: 'users.perm.browseMarketplace', admin: true, developer: true, viewer: true },
      { nameKey: 'users.perm.submitSkill', admin: false, developer: true, viewer: false },
      { nameKey: 'users.perm.approveSkill', admin: true, developer: false, viewer: false },
    ],
  },
  {
    catKey: 'users.cat.governance',
    permissions: [
      { nameKey: 'users.perm.viewTokenOrg', admin: true, developer: false, viewer: true },
      { nameKey: 'users.perm.viewTokenOwn', admin: true, developer: true, viewer: false },
      { nameKey: 'users.perm.setBudgetAlerts', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.viewAudit', admin: true, developer: true, viewer: true },
      { nameKey: 'users.perm.exportAudit', admin: true, developer: false, viewer: false },
    ],
  },
  {
    catKey: 'users.cat.administration',
    permissions: [
      { nameKey: 'users.perm.manageUsers', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.assignRoles', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.managePolicies', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.configProviders', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.orgSettings', admin: true, developer: false, viewer: false },
      { nameKey: 'users.perm.manageGroups', admin: true, developer: true, viewer: false },
    ],
  },
];

const roleDescriptions: Record<string, { icon: typeof ShieldCheck; descKey: string }> = {
  admin: { icon: ShieldCheck, descKey: 'users.roleDesc.admin' },
  developer: { icon: Shield, descKey: 'users.roleDesc.developer' },
  viewer: { icon: Eye, descKey: 'users.roleDesc.viewer' },
};

// ------------------------------------------------------------------ //
//  Users Page                                                         //
// ------------------------------------------------------------------ //

type SortKey = 'name' | 'email' | 'role' | 'plan' | 'status';
type SortDir = 'asc' | 'desc';
interface SortEntry {
  key: SortKey;
  dir: SortDir;
}

function parseSorts(param: string | null): SortEntry[] {
  if (!param) return [{ key: 'role', dir: 'asc' }]; // default sort
  return param
    .split(',')
    .map((s) => {
      const [key = '', dir] = s.split(':');
      const direction: SortDir = dir === 'desc' ? 'desc' : 'asc';
      return { key, dir: direction };
    })
    .filter((s): s is SortEntry =>
      (['name', 'email', 'role', 'plan', 'status'] as string[]).includes(s.key),
    );
}

function serializeSorts(sorts: SortEntry[]): string {
  return sorts.map((s) => `${s.key}:${s.dir}`).join(',');
}

export default function UsersPage() {
  const { t } = useLanguage();
  const roleLabel = (r: string) =>
    t(
      r === 'admin'
        ? 'users.roleAdmin'
        : r === 'developer'
          ? 'users.roleDeveloper'
          : 'users.roleViewer',
    );
  const searchParams = useSearchParams();
  const router = useRouter();
  const { page, limit, setPage, setLimit } = usePaginationParams();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersMeta, setUsersMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit,
    totalPages: 0,
  });
  const [policies, setPolicies] = useState<ApiPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<'form' | 'assign' | 'done'>('form');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [createdUserName, setCreatedUserName] = useState('');
  const [createdUserRole, setCreatedUserRole] = useState('');
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [deleteUser, setDeleteUser] = useState<ApiUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Agent assignment state
  const [agentDefs, setAgentDefs] = useState<{ id: string; name: string }[]>([]);
  const [assigningAgent, setAssigningAgent] = useState(false);
  // User agent assignments (userId -> { userAgentId, agentDefinitionId })
  const [userAgentMap, setUserAgentMap] = useState<
    Map<string, { userAgentId: string; agentDefinitionId: string }>
  >(new Map());
  const [editUserAgentId, setEditUserAgentId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, policiesRes, agentsRes, userAgentsRes] = await Promise.all([
        authFetch<PaginatedUsers>(`/admin/users?page=${page}&limit=${limit}`),
        authFetch<PaginatedPolicies>('/admin/policies?limit=100'),
        authFetch<{ data: { id: string; name: string; role: string }[] }>(
          '/api/v1/agents?role=primary&limit=100',
        ),
        authFetch<{ id: string; userId: string; agentDefinitionId: string }[]>(
          '/api/v1/agents/user-agents',
        ),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setUsersMeta(usersRes.meta);
      setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
      setAgentDefs(agentsRes.data.filter((a) => a.role === 'primary'));
      // Build user -> userAgent mapping
      const map = new Map<string, { userAgentId: string; agentDefinitionId: string }>();
      for (const ua of userAgentsRes) {
        map.set(ua.userId, { userAgentId: ua.id, agentDefinitionId: ua.agentDefinitionId });
      }
      setUserAgentMap(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleCreate(form: FormData) {
    setSaving(true);
    setError('');
    try {
      const role = formString(form, 'role');
      const created = await authFetch<ApiUser>('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          name: form.get('name'),
          password: form.get('password'),
          role,
          policyId: form.get('policyId'),
        }),
      });
      setCreatedUserId(created.id);
      setCreatedUserName(created.name);
      setCreatedUserRole(role);
      setSelectedAgentId('');

      // Skip agent assignment for viewers (they can't run agents)
      if (role === 'viewer') {
        setCreateStep('done');
      } else {
        setCreateStep('assign');
        // Fetch agent definitions for assignment step
        void authFetch<{ data: { id: string; name: string; role: string; isActive: boolean }[] }>(
          '/api/v1/agents?limit=100&role=primary',
        )
          .then((res) => {
            setAgentDefs(
              Array.isArray(res.data)
                ? res.data.filter((a) => a.isActive).map((a) => ({ id: a.id, name: a.name }))
                : [],
            );
          })
          .catch((e: unknown) => {
            toast.error(e instanceof Error ? e.message : 'Failed to load agent list');
          });
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.createError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignAgent() {
    if (!createdUserId || !selectedAgentId) return;
    setAssigningAgent(true);
    try {
      await authFetch('/api/v1/agents/user-agents', {
        method: 'POST',
        body: JSON.stringify({ userId: createdUserId, agentDefinitionId: selectedAgentId }),
      });
      setCreateStep('done');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign agent');
    } finally {
      setAssigningAgent(false);
    }
  }

  function closeCreateDialog() {
    setCreateOpen(false);
    setCreateStep('form');
    setCreatedUserId(null);
    setSelectedAgentId('');
  }

  function openEditUser(user: ApiUser) {
    setEditUser(user);
    setEditUserRole(user.role);
    const existing = userAgentMap.get(user.id);
    setEditUserAgentId(existing?.agentDefinitionId ?? '');
  }

  async function handleUpdate(id: string, data: Record<string, unknown>, agentDefId: string) {
    setSaving(true);
    setError('');
    try {
      // Update user data
      await authFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      // Handle primary agent assignment
      const existing = userAgentMap.get(id);
      if (agentDefId && agentDefId !== existing?.agentDefinitionId) {
        if (existing) {
          // Update existing user-agent assignment
          await authFetch(`/api/v1/agents/user-agents/${existing.userAgentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ agentDefinitionId: agentDefId }),
          });
        } else {
          // Create new user-agent assignment
          await authFetch('/api/v1/agents/user-agents', {
            method: 'POST',
            body: JSON.stringify({ userId: id, agentDefinitionId: agentDefId }),
          });
        }
      }

      setEditUser(null);
      setEditUserAgentId('');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.updateError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError('');
    try {
      await authFetch(`/admin/users/${id}`, { method: 'DELETE' });
      setDeleteUser(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.deleteError'));
    } finally {
      setSaving(false);
    }
  }

  // ---- Sorting ----
  const sorts = parseSorts(searchParams.get('sort'));

  function toggleSort(key: SortKey) {
    const existing = sorts.find((s) => s.key === key);
    let newSorts: SortEntry[];
    if (!existing) {
      // Add new sort column
      newSorts = [...sorts, { key, dir: 'asc' }];
    } else if (existing.dir === 'asc') {
      // Flip to desc
      newSorts = sorts.map((s) => (s.key === key ? { ...s, dir: 'desc' as SortDir } : s));
    } else {
      // Remove this sort
      newSorts = sorts.filter((s) => s.key !== key);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (newSorts.length > 0) {
      params.set('sort', serializeSorts(newSorts));
    } else {
      params.delete('sort');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function getSortIcon(key: SortKey) {
    const entry = sorts.find((s) => s.key === key);
    if (!entry) return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground/40" />;
    if (entry.dir === 'asc') return <ArrowUp className="ml-1 inline size-3" />;
    return <ArrowDown className="ml-1 inline size-3" />;
  }

  const sortedUsers = useMemo(() => {
    const roleOrder: Record<string, number> = { admin: 0, developer: 1, viewer: 2 };
    const policyMap = new Map(policies.map((p) => [p.id, p.name]));

    return [...users].sort((a, b) => {
      for (const { key, dir } of sorts) {
        let cmp = 0;
        switch (key) {
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'email':
            cmp = a.email.localeCompare(b.email);
            break;
          case 'role':
            cmp = (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
            break;
          case 'plan':
            cmp = (policyMap.get(a.policyId) ?? '').localeCompare(policyMap.get(b.policyId) ?? '');
            break;
          case 'status':
            cmp = Number(b.isActive) - Number(a.isActive);
            break;
        }
        if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
      }
      return 0;
    });
  }, [users, sorts, policies]);

  useAnimeOnMount(staggerFadeUp('[data-animate="user-rows"] tr', { stagger: STAGGER.tight }));

  // Role counts for the Roles tab cards
  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('users.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
        }}
      >
        <div className="flex items-center justify-between">
          <TabsList className="h-10 rounded-full p-1">
            <TabsTrigger value="users" className="rounded-full px-4">
              {t('users.tabUsers')}
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-full px-4">
              {t('users.tabRoles')}
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-full px-4">
              {t('users.tabGroups')}
            </TabsTrigger>
          </TabsList>
          {tab === 'users' && (
            <Button
              size="sm"
              onClick={() => {
                setCreateOpen(true);
              }}
            >
              <Plus className="mr-1 size-4" />
              {t('users.createUser')}
            </Button>
          )}
        </div>

        {/* ---- Users Tab ---- */}
        <TabsContent value="users" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-md border bg-background/30 backdrop-blur-sm p-8 text-center text-sm text-muted-foreground">
              {t('users.noUsers')}
            </div>
          ) : (
            <div className="rounded-md border bg-background/30 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        toggleSort('name');
                      }}
                    >
                      {t('users.colName')} {getSortIcon('name')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        toggleSort('email');
                      }}
                    >
                      {t('users.colEmail')} {getSortIcon('email')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        toggleSort('role');
                      }}
                    >
                      {t('users.colRole')} {getSortIcon('role')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        toggleSort('plan');
                      }}
                    >
                      {t('users.colPolicy')} {getSortIcon('plan')}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        toggleSort('status');
                      }}
                    >
                      {t('users.colStatus')} {getSortIcon('status')}
                    </TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody data-animate="user-rows">
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleVariant(user.role)}>{roleLabel(user.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {policies.find((p) => p.id === user.policyId)?.name ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                          {user.isActive ? t('users.active') : t('users.inactive')}
                        </Badge>
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
                                openEditUser(user);
                              }}
                            >
                              {t('users.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => {
                                setDeleteUser(user);
                              }}
                            >
                              {t('users.remove')}
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
          {!loading && users.length > 0 ? (
            <div className="mt-4">
              <DataPagination
                meta={usersMeta}
                onPageChange={setPage}
                onLimitChange={setLimit}
                label="users"
              />
            </div>
          ) : null}
        </TabsContent>

        {/* ---- Roles Tab ---- */}
        <TabsContent value="roles" className="mt-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {(['admin', 'developer', 'viewer'] as const).map((role) => {
              const def = roleDescriptions[role] ?? { icon: Shield, descKey: '' };
              const Icon = def.icon;
              const count = roleCounts[role] ?? 0;
              return (
                <div key={role} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{roleLabel(role)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {t('users.usersCount', { n: count })}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{t(def.descKey)}</p>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('users.permissionMatrix')}</h3>
            <div className="rounded-md border bg-background/30 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">{t('users.hdrPermission')}</TableHead>
                    <TableHead className="text-center">{t('users.roleAdmin')}</TableHead>
                    <TableHead className="text-center">{t('users.roleDeveloper')}</TableHead>
                    <TableHead className="text-center">{t('users.roleViewer')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionMatrix.map((group) => (
                    <Fragment key={group.catKey}>
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="bg-muted/50 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {t(group.catKey)}
                        </TableCell>
                      </TableRow>
                      {group.permissions.map((perm) => (
                        <TableRow key={perm.nameKey}>
                          <TableCell className="text-sm">{t(perm.nameKey)}</TableCell>
                          <TableCell className="text-center">
                            <PermissionIcon allowed={perm.admin} />
                          </TableCell>
                          <TableCell className="text-center">
                            <PermissionIcon allowed={perm.developer} />
                          </TableCell>
                          <TableCell className="text-center">
                            <PermissionIcon allowed={perm.viewer} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t('users.rolesSystemDefined')}</p>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <GroupsTab />
        </TabsContent>
      </Tabs>

      {/* ---- Create User Dialog (two-step) ---- */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateDialog();
        }}
      >
        <DialogContent>
          {createStep === 'form' && (
            <>
              <DialogHeader>
                <DialogTitle>{t('users.createTitle')}</DialogTitle>
                <DialogDescription>{t('users.createDesc')}</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreate(new FormData(e.currentTarget));
                }}
                className="flex flex-col gap-4"
                autoComplete="off"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-name">{t('users.name')}</Label>
                  <Input id="create-name" name="name" required autoComplete="off" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-email">{t('users.email')}</Label>
                  <Input id="create-email" name="email" type="email" required autoComplete="off" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-password">{t('users.password')}</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      minLength={8}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setShowPassword((v) => !v);
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-role">{t('users.role')}</Label>
                  <select
                    name="role"
                    id="create-role"
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    defaultValue="developer"
                  >
                    <option value="admin">{t('users.roleAdmin')}</option>
                    <option value="developer">{t('users.roleDeveloper')}</option>
                    <option value="viewer">{t('users.roleViewer')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-plan">{t('users.policy')}</Label>
                  <select
                    name="policyId"
                    id="create-plan"
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    defaultValue={
                      policies.find((p) => p.name === 'Standard')?.id ?? policies[0]?.id ?? ''
                    }
                  >
                    {policies
                      .filter((p) => p.isActive)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeCreateDialog}>
                    {t('users.cancel')}
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t('users.create')}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {createStep === 'assign' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-500/15">
                <Check className="size-8 text-green-500 animate-in zoom-in-50 duration-300" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t('users.userCreated')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('users.userCreatedDesc', { name: createdUserName })}
                </p>
              </div>
              <div className="flex w-full flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="assign-agent-def">{t('users.assignPrimaryAgent')}</Label>
                  <select
                    id="assign-agent-def"
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    value={selectedAgentId}
                    onChange={(e) => {
                      setSelectedAgentId(e.target.value);
                    }}
                    disabled={assigningAgent}
                  >
                    <option value="">{t('users.selectAgent')}</option>
                    {agentDefs.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">{t('users.assignAgentHint')}</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeCreateDialog}>
                    {t('users.skip')}
                  </Button>
                  <Button
                    disabled={!selectedAgentId || assigningAgent}
                    onClick={() => {
                      void handleAssignAgent();
                    }}
                  >
                    {assigningAgent && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t('users.assign')}
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}

          {createStep === 'done' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-500/15">
                <Check className="size-8 text-green-500 animate-in zoom-in-50 duration-300" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{t('users.allSet')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {createdUserRole === 'viewer'
                    ? t('users.allSetViewer', { name: createdUserName })
                    : t('users.allSetAgent', { name: createdUserName })}
                </p>
              </div>
              <Button onClick={closeCreateDialog}>{t('users.done')}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Edit User Dialog ---- */}
      <Dialog
        open={editUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditUser(null);
          }
        }}
      >
        {editUser && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('users.editTitle')}</DialogTitle>
              <DialogDescription>{t('users.editDesc', { name: editUser.name })}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void handleUpdate(
                  editUser.id,
                  {
                    name: form.get('name'),
                    role: form.get('role'),
                    policyId: form.get('policyId'),
                    isActive: form.get('isActive') === 'true',
                  },
                  editUserAgentId,
                );
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">{t('users.name')}</Label>
                <Input id="edit-name" name="name" defaultValue={editUser.name} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-role">{t('users.role')}</Label>
                <select
                  name="role"
                  id="edit-role"
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={editUserRole}
                  onChange={(e) => {
                    setEditUserRole(e.target.value);
                    if (e.target.value === 'viewer') {
                      setEditUserAgentId('');
                    }
                  }}
                >
                  <option value="admin">{t('users.roleAdmin')}</option>
                  <option value="developer">{t('users.roleDeveloper')}</option>
                  <option value="viewer">{t('users.roleViewer')}</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-plan">{t('users.policy')}</Label>
                <select
                  name="policyId"
                  id="edit-plan"
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  defaultValue={editUser.policyId}
                >
                  {policies
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-status">{t('users.colStatus')}</Label>
                <select
                  name="isActive"
                  id="edit-status"
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  defaultValue={String(editUser.isActive)}
                >
                  <option value="true">{t('users.statusActive')}</option>
                  <option value="false">{t('users.statusInactive')}</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-agent">{t('users.primaryAgent')}</Label>
                <select
                  id="edit-agent"
                  className="rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  value={editUserAgentId}
                  onChange={(e) => {
                    setEditUserAgentId(e.target.value);
                  }}
                  disabled={editUserRole === 'viewer'}
                >
                  <option value="">{t('users.noAgentAssigned')}</option>
                  {agentDefs.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {editUserRole === 'viewer'
                    ? t('users.viewerNoAgents')
                    : t('users.primaryAgentHint')}
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditUser(null);
                  }}
                >
                  {t('users.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {t('users.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* ---- Delete User Confirm ---- */}
      <AlertDialog
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
          }
        }}
      >
        {deleteUser && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('users.removeTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('users.removeConfirm', { name: deleteUser.name, email: deleteUser.email })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('users.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  void handleDelete(deleteUser.id);
                }}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t('users.remove')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}
