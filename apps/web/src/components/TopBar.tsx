'use client';

import { Building2, Download } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export function TopBar() {
  const job = useStore((s) => s.job);
  const stats = useStore(useShallow((s) => s.getStats()));

  const exportDisabled = !job || stats.accepted === 0;

  const handleExport = (): void => {
    window.open('/api/export?jobId=demo');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <Building2 className="size-5 text-blue-600" />
        <span className="text-lg font-semibold text-zinc-900">TakeoffAI</span>
        <Badge className="bg-blue-100 text-blue-700">BETA</Badge>
      </div>

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
      ) : null}

      <Button onClick={handleExport} disabled={exportDisabled}>
        <Download />
        Export CSV
      </Button>
    </header>
  );
}
