'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DetectionRow } from '@/components/DetectionRow';
import { useDetectionShortcuts } from '@/hooks/useDetectionShortcuts';
import { useStore } from '@/lib/store';
import type { DetectionStatus, Polygon } from '@/lib/types';
import { toast } from 'sonner';

type Filter = 'all' | DetectionStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const CATEGORY_ORDER: Polygon['category'][] = [
  'room',
  'equipment',
  'fixture',
  'wall',
];
const CATEGORY_HEADING: Record<Polygon['category'], string> = {
  room: 'Rooms',
  wall: 'Walls',
  fixture: 'Fixtures',
  equipment: 'Equipment',
};

export function DetectionList() {
  useDetectionShortcuts();

  const polygons = useStore(useShallow((s) => s.polygons));
  const filter = useStore((s) => s.sidebarFilter);
  const selectedId = useStore((s) => s.selectedPolygonId);
  const setFilter = useStore((s) => s.setSidebarFilter);
  const totalCount = polygons.length;
  const pendingCount = useMemo(
    () => polygons.filter((p) => p.status === 'pending').length,
    [polygons],
  );

  const visible = useMemo(
    () =>
      filter === 'all' ? polygons : polygons.filter((p) => p.status === filter),
    [polygons, filter],
  );

  const grouped = useMemo(() => {
    const map = new Map<Polygon['category'], Polygon[]>();
    for (const p of visible) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c) ?? [],
    }));
  }, [visible]);

  const onAcceptAll = (): void => {
    const n = useStore.getState().acceptAllPending();
    if (n > 0)
      toast.success(`Accepted ${n} pending detection${n === 1 ? '' : 's'}`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-hairline bg-carbon p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-bone">Detections</h2>
          <Badge variant="secondary" className="bg-carbon-high text-slate">
            {totalCount}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              size="xs"
              onClick={() => setFilter(f.value)}
              className={
                filter === f.value
                  ? 'bg-ember/15 text-ember hover:bg-ember/20 hover:text-ember'
                  : 'text-slate'
              }
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-2">
          {grouped.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-dim">
              {totalCount === 0
                ? 'No detections yet.'
                : 'No detections match this filter.'}
            </p>
          ) : (
            grouped.map((g) => (
              <div key={g.category} className="space-y-1">
                <div className="eyebrow px-3 pt-1">
                  {CATEGORY_HEADING[g.category]}{' '}
                  <span className="text-slate-dim/60">({g.items.length})</span>
                </div>
                <div className="space-y-0.5">
                  {g.items.map((p) => (
                    <DetectionRow
                      key={p.id}
                      polygon={p}
                      isSelected={p.id === selectedId}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />
      <div className="bg-carbon p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onAcceptAll}
          disabled={pendingCount === 0}
        >
          {pendingCount === 0
            ? 'All reviewed ✓'
            : `Accept all pending (${pendingCount})`}
        </Button>
      </div>
    </div>
  );
}
