'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Building2,
  ChevronsUpDown,
  Clock,
  FolderClosed,
  HelpCircle,
  Library,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: '/projects', label: 'Projects', icon: FolderClosed },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/usage', label: 'Usage', icon: Activity },
];

const FOOTER: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help Center', icon: HelpCircle },
];

const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => (
  <Link
    href={item.href}
    className={`flex items-center gap-3 rounded-xl px-4 py-2 text-[14px] font-medium transition-all duration-150 ${
      active
        ? 'border border-white/20 bg-white/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md'
        : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
    }`}
  >
    <item.icon className="size-[18px] shrink-0" />
    <span>{item.label}</span>
  </Link>
);

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-y-0 left-0 z-20 flex h-screen w-[280px] flex-col bg-slate-900 p-4">
      <div className="mb-2 px-4 py-6">
        <div className="flex items-center gap-2">
          <Building2 className="size-6 text-white" />
          <h1 className="text-[20px] font-bold tracking-tight text-white">
            CalienteAI
          </h1>
        </div>
        <p className="mt-1 text-[11px] font-semibold tracking-widest text-slate-400 uppercase opacity-80">
          Construction Takeoff v1.0
        </p>
      </div>

      <div className="mb-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="grid size-5 shrink-0 place-items-center rounded bg-white/10 font-mono text-[10px] text-white">
              MH
            </span>
            <span className="truncate">Memorial Hospital</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 space-y-1">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>

      <div className="mt-auto space-y-1 border-t border-white/5 pt-4">
        {FOOTER.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <Separator className="my-2 bg-white/5" />
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-[12px] font-bold text-white">
            DB
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              Account
            </div>
            <div className="truncate text-[11px] text-slate-400">
              Premium Tier
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
