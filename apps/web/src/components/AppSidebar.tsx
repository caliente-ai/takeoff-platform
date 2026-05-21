'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClerkLoaded, ClerkLoading, UserButton, useUser } from '@clerk/nextjs';
import {
  ChevronsUpDown,
  Flame,
  FolderClosed,
  HelpCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: '/projects', label: 'Projects', icon: FolderClosed },
];

const FOOTER: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help Center', icon: HelpCircle },
];

const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => (
  <Link
    href={item.href}
    className={`flex items-center gap-3 rounded-lg border px-4 py-2 text-[14px] font-medium transition-all duration-150 ${
      active
        ? 'border-ember/25 bg-ember/10 text-bone'
        : 'border-transparent text-slate hover:bg-carbon-high hover:text-bone'
    }`}
  >
    <item.icon
      className={`size-[18px] shrink-0 ${active ? 'text-ember' : ''}`}
    />
    <span>{item.label}</span>
  </Link>
);

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const { user } = useUser();
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account';
  const displayEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <nav className="fixed inset-y-0 left-0 z-20 flex h-screen w-[280px] flex-col border-r border-hairline bg-ink p-4">
      <div className="mb-2 px-2 py-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ember shadow-[0_4px_18px_-4px_rgba(255,92,53,0.55)]">
            <Flame className="size-[18px] text-ink" />
          </span>
          <h1 className="font-display text-[20px] font-semibold tracking-tight text-bone">
            Caliente AI
          </h1>
        </div>
        <p className="eyebrow mt-2.5 pl-0.5">Construction takeoff</p>
      </div>

      <div className="mb-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-hairline bg-carbon px-3 py-2 text-[13px] font-medium text-bone transition-colors hover:border-hairline-bright hover:bg-carbon-high"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="grid size-5 shrink-0 place-items-center rounded bg-carbon-high font-mono text-[10px] text-slate">
              MH
            </span>
            <span className="truncate">Memorial Hospital</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-slate-dim" />
        </button>
      </div>

      <div className="flex-1 space-y-1">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>

      <div className="mt-auto space-y-1 border-t border-hairline pt-4">
        {FOOTER.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <Separator className="my-2 bg-hairline" />
        <div className="flex items-center gap-3 px-2 py-2">
          <ClerkLoading>
            <div className="size-9 shrink-0 rounded-full bg-carbon-high" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton appearance={{ elements: { avatarBox: 'size-9' } }} />
          </ClerkLoaded>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-bone">
              {displayName}
            </div>
            {displayEmail && displayEmail !== displayName && (
              <div className="truncate text-[11px] text-slate-dim">
                {displayEmail}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
