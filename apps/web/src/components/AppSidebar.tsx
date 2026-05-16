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
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: '/projects', label: 'Projects', icon: FolderClosed },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/usage', label: 'Usage', icon: Activity },
];

const FOOTER: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

const NavLink = ({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) => (
  <Link
    href={item.href}
    className={`flex h-10 items-center gap-3 px-4 text-[13px] font-medium transition-colors ${
      active
        ? 'border-l-2 border-blue-600 bg-zinc-100 pl-[14px] text-blue-700'
        : 'border-l-2 border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
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
    <nav className="fixed inset-y-0 left-0 z-20 flex h-screen w-60 flex-col border-r border-zinc-200 bg-white py-4">
      <div className="mb-5 flex items-center gap-2 px-4">
        <Building2 className="size-5 text-blue-600" />
        <span className="text-[18px] font-bold tracking-tight text-blue-700">
          CalienteAI
        </span>
        <Badge className="ml-1 bg-zinc-100 px-1.5 py-0 text-[10px] tracking-wider text-zinc-600 uppercase">
          BETA
        </Badge>
      </div>

      <div className="mb-4 px-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="grid size-5 shrink-0 place-items-center rounded bg-zinc-200 font-mono text-[10px] text-zinc-600">
              MH
            </span>
            <span className="truncate">Memorial Hospital</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-zinc-500" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-0.5 px-0">
        <Separator className="my-2" />
        {FOOTER.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  );
}
