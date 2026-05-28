'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Coins,
  Compass,
  CreditCard,
  FolderOpen,
  Notebook,
  MonitorPlay,
  LogOut,
  MessageSquare,
  Moon,
  Radio,
  ScrollText,
  Settings2,
  Sun,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import anime from 'animejs';
import { EASING } from '@/lib/anime';
import { useLanguage } from '@/i18n';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const platformItems = [
  { titleKey: 'nav.conversations', icon: MessageSquare, href: '/conversations' },
  { titleKey: 'nav.explore', icon: Compass, href: '/explore' },
  { titleKey: 'nav.workspace', icon: FolderOpen, href: '/workspace' },
  { titleKey: 'nav.projector', icon: MonitorPlay, href: '/projector' },
  { titleKey: 'nav.skills', icon: Wrench, href: '/skills' },
  { titleKey: 'nav.agents', icon: Bot, href: '/agents' },
];

interface NavItem {
  readonly titleKey: string;
  readonly href: string;
  readonly icon: typeof BookOpen;
  readonly adminOnly?: boolean;
}

const communityItems: readonly NavItem[] = [
  { titleKey: 'nav.groups', href: '/governance/groups', icon: Users },
  { titleKey: 'nav.memory', href: '/memory', icon: Notebook },
];

const governanceItems: readonly NavItem[] = [
  { titleKey: 'nav.dashboard', href: '/dashboard', icon: BookOpen },
  { titleKey: 'nav.tokenUsage', href: '/governance/tokens', icon: Coins },
  { titleKey: 'nav.auditLogs', href: '/governance/audit', icon: ScrollText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const animateSubItems = useCallback((container: HTMLElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = container.querySelectorAll('[data-sidebar="menu-sub-item"]');
    items.forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(8px)';
    });
    anime({
      targets: items,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 300,
      delay: anime.stagger(50),
      easing: EASING,
    });
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Shared nav-item polish: 2px left stripe that appears on hover/active +
  // small horizontal slide so the cursor anchor matches the rest of the
  // dashboard's lift-and-stripe vocabulary (Memory/Groups/Skills cards).
  const navButtonClass =
    'transition-[transform,background-color,box-shadow] duration-150 hover:translate-x-0.5 hover:shadow-[inset_2px_0_0_0_hsl(var(--sidebar-primary)/0.6)] data-[active=true]:shadow-[inset_2px_0_0_0_hsl(var(--sidebar-primary))]';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/40 group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="group/brand">
                <div className="flex size-8 items-center justify-center rounded-md transition-transform duration-200 group-hover/brand:scale-110">
                  <Image
                    src="/brand/clawix-logo.png"
                    alt="Clawix"
                    width={28}
                    height={28}
                    priority
                    // Light mode: render the original (dark shield + chrome
                    // claws on a light chip — both visible).
                    // Dark mode: invert flips the dark interior to light and
                    // the chrome highlights to dark, so the shape pops on
                    // the dark chip while the original photographic detail
                    // is preserved (no silhouette flattening).
                    className="size-7 object-contain dark:invert"
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold tracking-tight">Clawix</span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {t('nav.enterpriseAi')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {t('nav.groupWorkspace')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {platformItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={t(item.titleKey)}
                  className={navButtonClass}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{t(item.titleKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {t('nav.groupCommunity')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {communityItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={t(item.titleKey)}
                  className={navButtonClass}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{t(item.titleKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {t('nav.groupGovernance')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {governanceItems
              .filter((item) => !item.adminOnly || user?.role === 'admin')
              .map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={t(item.titleKey)}
                    className={navButtonClass}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            <Collapsible
              defaultOpen={pathname.startsWith('/settings')}
              className="group/collapsible"
              onOpenChange={(open) => {
                if (open) {
                  requestAnimationFrame(() => {
                    const el = document.querySelector(
                      '.group\\/collapsible [data-sidebar="menu-sub"]',
                    );
                    if (el) animateSubItems(el as HTMLElement);
                  });
                }
              }}
            >
              {user?.role === 'admin' && (
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/settings')}
                      tooltip={t('nav.settings')}
                      className={navButtonClass}
                    >
                      <Settings2 />
                      <span>{t('nav.settings')}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {[
                        { titleKey: 'nav.users', href: '/settings/users', icon: Users },
                        { titleKey: 'nav.policies', href: '/settings/policies', icon: CreditCard },
                        { titleKey: 'nav.channels', href: '/settings/channels', icon: Radio },
                        { titleKey: 'nav.providers', href: '/settings/providers', icon: Bot },
                      ].map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(item.href)}
                            className="transition-all duration-150 hover:translate-x-0.5"
                          >
                            <Link href={item.href}>
                              <item.icon />
                              <span>{t(item.titleKey)}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              )}
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
              tooltip={isDark ? t('nav.lightMode') : t('nav.darkMode')}
              onClick={() => {
                setTheme(isDark ? 'light' : 'dark');
              }}
            >
              <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span>{mounted ? (isDark ? t('nav.lightMode') : t('nav.darkMode')) : t('nav.toggleTheme')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {(user?.email[0] ?? 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.email.split('@')[0] ?? 'User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? 'user@example.com'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuItem
                  onSelect={() => {
                    router.push('/profile');
                  }}
                >
                  <User className="mr-2 size-4" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    void logout().then(() => {
                      router.push('/login');
                    });
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
