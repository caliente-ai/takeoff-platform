'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MousePointerClick } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import type { DetectionStatus, Polygon } from '@/lib/types';

const STATUS_BADGE: Record<DetectionStatus, string> = {
  pending: 'bg-blueprint/15 text-blueprint-bright',
  accepted: 'bg-status-accepted/15 text-status-accepted',
  rejected: 'bg-status-rejected/15 text-status-rejected',
};

const CATEGORY_LABEL: Record<Polygon['category'], string> = {
  room: 'Room',
  wall: 'Wall',
  fixture: 'Fixture',
  equipment: 'Equipment',
};

const confidenceTone = (c: number): string => {
  if (c >= 0.9) return 'bg-status-accepted';
  if (c >= 0.7) return 'bg-ember';
  return 'bg-status-rejected';
};

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate">{k}</span>
    <span className="font-medium text-bone">{v}</span>
  </div>
);

export function DetailPanel() {
  const polygon = useStore((s) => {
    if (!s.selectedPolygonId) return null;
    return s.polygons.find((p) => p.id === s.selectedPolygonId) ?? null;
  });
  const [showCoords, setShowCoords] = useState(false);

  if (!polygon) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <MousePointerClick className="size-8 text-slate-dim/50" />
        <p className="text-sm text-slate-dim">
          Select a detection to see details
        </p>
      </div>
    );
  }

  const onAccept = (): void => {
    useStore.getState().updatePolygonStatus(polygon.id, 'accepted');
    toast.success(`Accepted: ${polygon.label}`);
  };
  const onReject = (): void => {
    useStore.getState().updatePolygonStatus(polygon.id, 'rejected');
    toast.success(`Rejected: ${polygon.label}`);
  };
  const onDelete = (): void => {
    useStore.getState().deletePolygon(polygon.id);
    toast.success(`Deleted: ${polygon.label}`);
  };

  const confidencePct = Math.round(polygon.confidence * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold text-bone">
          {polygon.label}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-carbon-high text-slate">
            {CATEGORY_LABEL[polygon.category]}
          </Badge>
          <Badge variant="secondary" className={STATUS_BADGE[polygon.status]}>
            {polygon.status.charAt(0).toUpperCase() + polygon.status.slice(1)}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate">Confidence</span>
          <span className="font-mono font-medium text-bone">
            {confidencePct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-carbon-high">
          <div
            className={`h-full rounded-full transition-all ${confidenceTone(polygon.confidence)}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2.5 p-5">
        <Row k="Area" v={`${polygon.area_sqft} sqft`} />
        <Row k="Perimeter" v={`${polygon.perimeter_ft} ft`} />
        <Row k="Vertices" v={polygon.points.length} />
        <Row
          k="Detection ID"
          v={
            <span className="font-mono text-xs text-slate-dim">
              {polygon.id}
            </span>
          }
        />
      </div>

      <Separator />

      <div className="space-y-2 p-5">
        {polygon.status !== 'accepted' && (
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-status-accepted text-sm font-semibold text-ink transition-all hover:brightness-110"
          >
            Accept
          </button>
        )}
        {polygon.status !== 'rejected' && (
          <Button
            variant="outline"
            className="w-full border-status-rejected/40 text-status-rejected hover:border-status-rejected/60 hover:bg-status-rejected/10 hover:text-status-rejected"
            onClick={onReject}
          >
            Reject
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-dim"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>

      <Separator />

      <div className="p-5">
        <button
          type="button"
          onClick={() => setShowCoords((v) => !v)}
          className="flex w-full items-center gap-1 text-xs font-medium text-slate-dim hover:text-bone"
        >
          {showCoords ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
          Coordinates ({polygon.points.length} points)
        </button>
        {showCoords && (
          <pre className="mt-2 max-h-48 overflow-auto rounded border border-hairline bg-ink p-2 font-mono text-[10px] text-slate">
            {polygon.points.map((p, i) => `${i}: [${p[0]}, ${p[1]}]`).join('\n')}
          </pre>
        )}
      </div>
    </div>
  );
}
