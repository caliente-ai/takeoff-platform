'use client';

import { Building2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '@/components/ui/badge';
import { ExportButton } from '@/components/ExportButton';
import { useStore } from '@/lib/store';

type Props = { onLogoTap?: () => void };

export function TopBar({ onLogoTap }: Props = {}) {
  const job = useStore((s) => s.job);
  const stats = useStore(useShallow((s) => s.getStats()));

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <button
        type="button"
        onClick={onLogoTap}
        className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        <Building2 className="size-5 text-blue-600" />
        <span className="text-lg font-semibold text-zinc-900">TakeoffAI</span>
        <Badge className="bg-blue-100 text-blue-700">BETA</Badge>
      </button>

      {job ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">
            {stats.total} detected
          </Badge>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            {stats.accepted} accepted
          </Badge>
          <Badge variant="secondary" className="bg-rose-100 text-rose-700">
            {stats.rejected} rejected
          </Badge>
        </div>
      ) : (
        <div />
      )}

      <ExportButton />
    </header>
  );
}
