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
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex items-baseline gap-2">
        <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {count !== undefined && (
          <span className="font-mono text-[13px] text-slate-500">({count})</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {searchPlaceholder && (
          <div className="relative w-80">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="h-10 rounded-full border-slate-200 bg-slate-50 pr-12 pl-11 text-[14px] placeholder:text-slate-400 focus-visible:bg-white"
            />
            <div className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] text-slate-500">
                ⌘
              </kbd>
              <kbd className="rounded border border-slate-200 bg-white px-1 font-mono text-[10px] text-slate-500">
                K
              </kbd>
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="grid size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <HelpCircle className="size-[18px]" />
        </button>
        {right && (
          <>
            <div className="h-6 w-px bg-slate-200" />
            {right}
          </>
        )}
      </div>
    </header>
  );
}
