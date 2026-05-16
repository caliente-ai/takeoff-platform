'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

export function ExportButton() {
  const stats = useStore(useShallow((s) => s.getStats()));
  const disabled = stats.accepted === 0;

  const onExport = async (): Promise<void> => {
    try {
      const overrides = useStore.getState().polygons.map((p) => ({
        id: p.id,
        status: p.status,
      }));
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides, statusFilter: 'accepted' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'takeoff-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(
        `Exported ${stats.accepted} accepted item${stats.accepted === 1 ? '' : 's'} to CSV`,
      );
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  return (
    <Button onClick={onExport} disabled={disabled}>
      <Download />
      Export CSV
    </Button>
  );
}
