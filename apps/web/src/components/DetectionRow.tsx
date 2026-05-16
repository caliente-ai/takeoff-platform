'use client';

import { Check, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import type { Polygon } from '@/lib/types';

type Props = { polygon: Polygon; isSelected: boolean };

const STATUS_BAR: Record<Polygon['status'], string> = {
  pending: 'border-l-blue-500',
  accepted: 'border-l-emerald-500',
  rejected: 'border-l-rose-500',
};

const CATEGORY_BADGE: Record<Polygon['category'], string> = {
  room: 'bg-blue-100 text-blue-700',
  wall: 'bg-zinc-200 text-zinc-700',
  fixture: 'bg-amber-100 text-amber-700',
  equipment: 'bg-violet-100 text-violet-700',
};

const CATEGORY_LABEL: Record<Polygon['category'], string> = {
  room: 'Room',
  wall: 'Wall',
  fixture: 'Fixture',
  equipment: 'Equipment',
};

export function DetectionRow({ polygon, isSelected }: Props) {
  const onSelect = (): void => {
    useStore.getState().selectPolygon(polygon.id);
  };
  const stop = (e: React.MouseEvent): void => e.stopPropagation();

  const accept = (e: React.MouseEvent): void => {
    stop(e);
    useStore.getState().updatePolygonStatus(polygon.id, 'accepted');
    toast.success(`Accepted: ${polygon.label}`);
  };
  const reject = (e: React.MouseEvent): void => {
    stop(e);
    useStore.getState().updatePolygonStatus(polygon.id, 'rejected');
    toast.success(`Rejected: ${polygon.label}`);
  };
  const remove = (e: React.MouseEvent): void => {
    stop(e);
    useStore.getState().deletePolygon(polygon.id);
    toast.success(`Deleted: ${polygon.label}`);
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-start gap-3 rounded-lg border-l-4 px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
        STATUS_BAR[polygon.status]
      } ${
        isSelected
          ? 'bg-blue-50 ring-1 ring-blue-200'
          : 'hover:bg-zinc-50'
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-zinc-900">
            {polygon.label}
          </span>
          <Badge variant="secondary" className="bg-zinc-100 text-[10px] text-zinc-600">
            {Math.round(polygon.confidence * 100)}%
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Badge
            variant="secondary"
            className={`${CATEGORY_BADGE[polygon.category]} px-1.5 text-[10px]`}
          >
            {CATEGORY_LABEL[polygon.category]}
          </Badge>
          <span>
            {polygon.area_sqft} {polygon.category === 'wall' ? 'sqft' : 'sqft'}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <span
          role="button"
          aria-label="Accept"
          onClick={accept}
          className="grid size-7 place-items-center rounded text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600"
        >
          <Check className="size-4" />
        </span>
        <span
          role="button"
          aria-label="Reject"
          onClick={reject}
          className="grid size-7 place-items-center rounded text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="size-4" />
        </span>
        <span
          role="button"
          aria-label="Delete"
          onClick={remove}
          className="grid size-7 place-items-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Trash2 className="size-4" />
        </span>
      </div>
    </button>
  );
}
