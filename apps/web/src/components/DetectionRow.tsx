'use client';

import { Check, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import type { Polygon } from '@/lib/types';

type Props = { polygon: Polygon; isSelected: boolean };

const STATUS_BAR: Record<Polygon['status'], string> = {
  pending: 'border-l-status-pending',
  accepted: 'border-l-status-accepted',
  rejected: 'border-l-status-rejected',
};

const CATEGORY_BADGE: Record<Polygon['category'], string> = {
  room: 'bg-blueprint/12 text-blueprint-bright',
  wall: 'bg-carbon-high text-slate-dim',
  fixture: 'bg-carbon-high text-slate',
  equipment: 'bg-blueprint/12 text-blueprint-bright',
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
      className={`group flex w-full items-start gap-3 rounded-lg border-l-4 px-3 py-2.5 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ember/40 focus-visible:outline-none ${
        STATUS_BAR[polygon.status]
      } ${
        isSelected
          ? 'bg-ember/10 ring-1 ring-ember/30'
          : 'hover:bg-carbon-high'
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-bone">
            {polygon.label}
          </span>
          <Badge
            variant="secondary"
            className="bg-carbon-high font-mono text-[10px] text-slate"
          >
            {Math.round(polygon.confidence * 100)}%
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate">
          <Badge
            variant="secondary"
            className={`${CATEGORY_BADGE[polygon.category]} px-1.5 text-[10px]`}
          >
            {CATEGORY_LABEL[polygon.category]}
          </Badge>
          <span className="font-mono text-slate-dim">
            {polygon.area_sqft} sqft
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <span
          role="button"
          aria-label="Accept"
          onClick={accept}
          className="grid size-7 place-items-center rounded text-slate-dim hover:bg-status-accepted/10 hover:text-status-accepted"
        >
          <Check className="size-4" />
        </span>
        <span
          role="button"
          aria-label="Reject"
          onClick={reject}
          className="grid size-7 place-items-center rounded text-slate-dim hover:bg-status-rejected/10 hover:text-status-rejected"
        >
          <X className="size-4" />
        </span>
        <span
          role="button"
          aria-label="Delete"
          onClick={remove}
          className="grid size-7 place-items-center rounded text-slate-dim hover:bg-carbon-high hover:text-bone"
        >
          <Trash2 className="size-4" />
        </span>
      </div>
    </button>
  );
}
