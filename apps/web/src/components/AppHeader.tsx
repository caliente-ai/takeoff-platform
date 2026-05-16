'use client';

import { Bell, HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Props = {
  title: string;
  count?: number;
  searchPlaceholder?: string;
  right?: React.ReactNode;
};

export function AppHeader({ title, count, searchPlaceholder, right }: Props) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-baseline gap-2">
        <h1 className="text-[18px] font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        {count !== undefined && (
          <span className="font-mono text-[13px] text-zinc-500">({count})</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {searchPlaceholder && (
          <div className="relative w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="h-8 border-zinc-200 pr-12 pl-8 text-[13px]"
            />
            <div className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px] text-zinc-500">
                ⌘
              </kbd>
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px] text-zinc-500">
                K
              </kbd>
            </div>
          </div>
        )}
        <div className="h-5 w-px bg-zinc-200" />
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-8 place-items-center rounded text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="grid size-8 place-items-center rounded text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <HelpCircle className="size-[18px]" />
        </button>
        {right && (
          <>
            <div className="h-5 w-px bg-zinc-200" />
            {right}
          </>
        )}
      </div>
    </header>
  );
}
