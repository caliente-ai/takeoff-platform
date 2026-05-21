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
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-ink/80 px-8 backdrop-blur-xl">
      <div className="flex items-baseline gap-2.5">
        <h1 className="font-display text-[20px] font-semibold tracking-tight text-bone">
          {title}
        </h1>
        {count !== undefined && (
          <span className="font-mono text-[13px] text-slate-dim">
            ({count})
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {searchPlaceholder && (
          <div className="relative w-80">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-dim" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="h-10 rounded-full border-hairline pr-12 pl-11 text-[14px] text-bone placeholder:text-slate-dim dark:bg-carbon dark:focus-visible:bg-carbon-high"
            />
            <div className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 gap-1">
              <kbd className="rounded border border-hairline bg-carbon-high px-1 font-mono text-[10px] text-slate-dim">
                ⌘
              </kbd>
              <kbd className="rounded border border-hairline bg-carbon-high px-1 font-mono text-[10px] text-slate-dim">
                K
              </kbd>
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-9 place-items-center rounded-full text-slate transition-colors hover:bg-carbon-high hover:text-bone"
        >
          <Bell className="size-[18px]" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="grid size-9 place-items-center rounded-full text-slate transition-colors hover:bg-carbon-high hover:text-bone"
        >
          <HelpCircle className="size-[18px]" />
        </button>
        {right && (
          <>
            <div className="h-6 w-px bg-hairline" />
            {right}
          </>
        )}
      </div>
    </header>
  );
}
