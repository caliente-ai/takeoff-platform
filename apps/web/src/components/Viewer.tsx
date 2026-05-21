'use client';

import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type OpenSeadragonNS from 'openseadragon';
import { useStore } from '@/lib/store';
import type { DetectionStatus, Polygon } from '@/lib/types';

type Props = { tileSource: string };

const SVG_NS = 'http://www.w3.org/2000/svg';

// Detection status colors — blueprint / emerald / rose (Ember-tuned)
const STATUS_COLOR: Record<DetectionStatus, string> = {
  pending: '#3b82f6',
  accepted: '#10b981',
  rejected: '#f43f5e',
};

// Ember — the "lock-on" accent for the selected polygon
const SELECTED_COLOR = '#ff5c35';
// Blueprint bright — in-progress polygon drawing
const DRAW_COLOR = '#5b9bff';

const CATEGORY_Z: Record<Polygon['category'], number> = {
  wall: 0,
  room: 1,
  equipment: 2,
  fixture: 3,
};

const bbox = (points: [number, number][]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};

const screenToImage = (svg: SVGSVGElement, clientX: number, clientY: number) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inv = ctm.inverse();
  const r = pt.matrixTransform(inv);
  return { x: r.x, y: r.y };
};

export default function Viewer({ tileSource }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragonNS.Viewer | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const osdRef = useRef<typeof OpenSeadragonNS | null>(null);
  const imageSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const [zoomPct, setZoomPct] = useState<number | null>(null);

  const polygons = useStore((s) => s.polygons);
  const selectedId = useStore((s) => s.selectedPolygonId);
  const editMode = useStore((s) => s.editMode);

  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!containerRef.current) return;
      const mod = await import('openseadragon');
      const OpenSeadragon = mod.default;
      osdRef.current = OpenSeadragon;
      if (cancelled || !containerRef.current) return;

      const viewer = OpenSeadragon({
        element: containerRef.current,
        tileSources: tileSource,
        prefixUrl: '/osd-images/',
        showNavigationControl: false,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        navigatorSizeRatio: 0.13,
        minZoomLevel: 0.4,
        maxZoomLevel: 12,
        visibilityRatio: 0.8,
        constrainDuringPan: true,
        animationTime: 0.3,
        gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
      });
      viewerRef.current = viewer;

      viewer.addHandler('open', () => {
        const item = viewer.world.getItemAt(0);
        if (!item) return;
        const size = item.getContentSize();
        imageSizeRef.current = { w: size.x, h: size.y };
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${size.x} ${size.y}`);
        svg.setAttribute('width', String(size.x));
        svg.setAttribute('height', String(size.y));
        svg.style.pointerEvents = 'auto';
        overlayRef.current = svg;
        viewer.addOverlay({
          element: svg,
          location: new OpenSeadragon.Rect(0, 0, 1, size.y / size.x),
        });
        setIsOpen(true);
      });

      viewer.addHandler('zoom', () => {
        const z = viewer.viewport.getZoom(true);
        setZoomPct(Math.round(z * 100));
      });
    })();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
      overlayRef.current = null;
      setIsOpen(false);
    };
  }, [tileSource]);

  useEffect(() => {
    const svg = overlayRef.current;
    const viewer = viewerRef.current;
    if (!svg || !isOpen) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const sorted = [...polygons].sort(
      (a, b) => CATEGORY_Z[a.category] - CATEGORY_Z[b.category],
    );

    const handleSize = Math.max(8, Math.min(20, imageSizeRef.current.w / 600));
    const edgeHandleSize = handleSize * 0.7;

    for (const p of sorted) {
      const color = STATUS_COLOR[p.status];
      const isSelected = p.id === selectedId;
      const strokeColor = isSelected ? SELECTED_COLOR : color;
      const baseOpacity = isSelected ? 0.35 : 0.18;

      const el = document.createElementNS(SVG_NS, 'polygon');
      el.setAttribute('points', p.points.map((pt) => pt.join(',')).join(' '));
      el.setAttribute('fill', color);
      el.setAttribute('fill-opacity', String(baseOpacity));
      el.setAttribute('stroke', strokeColor);
      el.setAttribute('stroke-width', isSelected ? '4' : '2');
      el.style.cursor = editMode ? 'move' : 'pointer';
      el.style.transition = 'fill-opacity 120ms ease';

      if (editMode) {
        // Drag whole polygon
        el.addEventListener('pointerdown', (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          useStore.getState().selectPolygon(p.id);
          if (!viewer) return;
          viewer.setMouseNavEnabled(false);
          (el as Element & { setPointerCapture: (id: number) => void }).setPointerCapture(
            e.pointerId,
          );
          const start = screenToImage(svg, e.clientX, e.clientY);
          let lastX = start.x;
          let lastY = start.y;
          const onMove = (mv: PointerEvent) => {
            const cur = screenToImage(svg, mv.clientX, mv.clientY);
            const dx = cur.x - lastX;
            const dy = cur.y - lastY;
            lastX = cur.x;
            lastY = cur.y;
            useStore.getState().movePolygon(p.id, dx, dy);
          };
          const onUp = () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
            viewer.setMouseNavEnabled(true);
          };
          el.addEventListener('pointermove', onMove);
          el.addEventListener('pointerup', onUp);
          el.addEventListener('pointercancel', onUp);
        });
      } else {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          useStore.getState().selectPolygon(p.id);
        });
        el.addEventListener('mouseenter', () => {
          el.setAttribute('fill-opacity', String(Math.min(baseOpacity + 0.14, 0.6)));
        });
        el.addEventListener('mouseleave', () => {
          const stillSelected = p.id === useStore.getState().selectedPolygonId;
          el.setAttribute('fill-opacity', String(stillSelected ? 0.35 : 0.18));
        });
      }
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = `${p.label} (${Math.round(p.confidence * 100)}%)`;
      el.appendChild(title);
      svg.appendChild(el);

      // Edit handles — only on selected polygon when in edit mode
      if (editMode && isSelected) {
        // Vertex handles
        p.points.forEach((pt, idx) => {
          const handle = document.createElementNS(SVG_NS, 'circle');
          handle.setAttribute('cx', String(pt[0]));
          handle.setAttribute('cy', String(pt[1]));
          handle.setAttribute('r', String(handleSize));
          handle.setAttribute('fill', '#ffffff');
          handle.setAttribute('stroke', SELECTED_COLOR);
          handle.setAttribute('stroke-width', '3');
          handle.style.cursor = 'grab';
          handle.addEventListener('pointerdown', (e: PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.shiftKey) {
              // Delete vertex if at least 3 remain
              if (p.points.length > 3) {
                const next = p.points.filter((_, i) => i !== idx);
                useStore.getState().updatePolygonPoints(p.id, next);
              }
              return;
            }
            if (!viewer) return;
            viewer.setMouseNavEnabled(false);
            (handle as Element & {
              setPointerCapture: (id: number) => void;
            }).setPointerCapture(e.pointerId);
            const onMove = (mv: PointerEvent) => {
              const cur = screenToImage(svg, mv.clientX, mv.clientY);
              const cur2: [number, number] = [Math.round(cur.x), Math.round(cur.y)];
              const latest = useStore
                .getState()
                .polygons.find((q) => q.id === p.id);
              if (!latest) return;
              const next = latest.points.map(
                (pp, i) => (i === idx ? cur2 : pp) as [number, number],
              );
              useStore.getState().updatePolygonPoints(p.id, next);
            };
            const onUp = () => {
              handle.removeEventListener('pointermove', onMove);
              handle.removeEventListener('pointerup', onUp);
              handle.removeEventListener('pointercancel', onUp);
              viewer.setMouseNavEnabled(true);
            };
            handle.addEventListener('pointermove', onMove);
            handle.addEventListener('pointerup', onUp);
            handle.addEventListener('pointercancel', onUp);
          });
          const ttitle = document.createElementNS(SVG_NS, 'title');
          ttitle.textContent = `Vertex ${idx} — drag to move, Shift+click to delete`;
          handle.appendChild(ttitle);
          svg.appendChild(handle);
        });

        // Midpoint handles (Alt+click adds vertex) — show as small hollow squares
        p.points.forEach((pt, idx) => {
          const next = p.points[(idx + 1) % p.points.length];
          const mx = (pt[0] + next[0]) / 2;
          const my = (pt[1] + next[1]) / 2;
          const mid = document.createElementNS(SVG_NS, 'rect');
          mid.setAttribute('x', String(mx - edgeHandleSize / 2));
          mid.setAttribute('y', String(my - edgeHandleSize / 2));
          mid.setAttribute('width', String(edgeHandleSize));
          mid.setAttribute('height', String(edgeHandleSize));
          mid.setAttribute('fill', '#ffffff');
          mid.setAttribute('stroke', SELECTED_COLOR);
          mid.setAttribute('stroke-width', '2');
          mid.style.cursor = 'copy';
          mid.addEventListener('click', (e) => {
            e.stopPropagation();
            const latest = useStore.getState().polygons.find((q) => q.id === p.id);
            if (!latest) return;
            const insertAt = idx + 1;
            const newPoints = [...latest.points];
            newPoints.splice(insertAt, 0, [Math.round(mx), Math.round(my)]);
            useStore.getState().updatePolygonPoints(p.id, newPoints);
          });
          const ttitle = document.createElementNS(SVG_NS, 'title');
          ttitle.textContent = 'Click to insert vertex here';
          mid.appendChild(ttitle);
          svg.appendChild(mid);
        });
      }
    }

    // In-progress drawing of new polygon
    if (editMode && isDrawing && drawingPoints.length > 0) {
      const path = document.createElementNS(SVG_NS, 'polyline');
      path.setAttribute('points', drawingPoints.map((pt) => pt.join(',')).join(' '));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', DRAW_COLOR);
      path.setAttribute('stroke-width', '3');
      path.setAttribute('stroke-dasharray', '8,6');
      svg.appendChild(path);
      drawingPoints.forEach((pt) => {
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', String(pt[0]));
        c.setAttribute('cy', String(pt[1]));
        c.setAttribute('r', String(handleSize * 0.7));
        c.setAttribute('fill', DRAW_COLOR);
        svg.appendChild(c);
      });
    }
  }, [polygons, selectedId, isOpen, editMode, isDrawing, drawingPoints]);

  // Empty-area clicks: while drawing, add a vertex
  useEffect(() => {
    const svg = overlayRef.current;
    const viewer = viewerRef.current;
    if (!svg || !isOpen || !editMode) return;
    const onClick = (e: MouseEvent) => {
      if (!isDrawing) return;
      // Ignore clicks that hit a polygon or handle
      const target = e.target as Element | null;
      if (target && target !== svg) return;
      e.stopPropagation();
      const p = screenToImage(svg, e.clientX, e.clientY);
      setDrawingPoints((prev) => [...prev, [Math.round(p.x), Math.round(p.y)]]);
    };
    svg.addEventListener('click', onClick);
    if (isDrawing && viewer) {
      viewer.setMouseNavEnabled(false);
    }
    return () => {
      svg.removeEventListener('click', onClick);
      if (viewer) viewer.setMouseNavEnabled(true);
    };
  }, [isOpen, editMode, isDrawing]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isOpen || !selectedId) return;
    if (editMode) return;
    const target = polygons.find((p) => p.id === selectedId);
    if (!target) return;
    const b = bbox(target.points);
    const pad = Math.max(b.w, b.h) * 0.25;
    const rect = viewer.viewport.imageToViewportRectangle(
      b.x - pad,
      b.y - pad,
      b.w + pad * 2,
      b.h + pad * 2,
    );
    viewer.viewport.fitBounds(rect, false);
  }, [selectedId, polygons, isOpen, editMode]);

  // Drawing toolbar handlers (Enter finishes, Escape cancels)
  useEffect(() => {
    if (!editMode || !isDrawing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && drawingPoints.length >= 3) {
        finishDrawing();
      } else if (e.key === 'Escape') {
        setIsDrawing(false);
        setDrawingPoints([]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const finishDrawing = () => {
    if (drawingPoints.length < 3) return;
    const id = `det_${Date.now().toString(36)}`;
    const polygon: Polygon = {
      id,
      label: 'New polygon',
      category: 'room',
      status: 'pending',
      confidence: 1,
      points: drawingPoints,
      area_sqft: 0,
      perimeter_ft: 0,
      color: '#3b82f6',
    };
    useStore.getState().addPolygon(polygon);
    // recompute derived metrics via updatePolygonPoints
    useStore.getState().updatePolygonPoints(id, drawingPoints);
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const zoomBy = (factor: number): void => {
    const v = viewerRef.current;
    if (!v) return;
    v.viewport.zoomBy(factor);
    v.viewport.applyConstraints();
  };

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 bg-ink" />

      {/* Zoom control */}
      <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-lg border border-hairline bg-carbon/90 p-1 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomBy(0.8)}
          className="grid size-6 place-items-center rounded text-slate transition-colors hover:bg-carbon-high hover:text-bone"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-12 text-center font-mono text-[11px] text-slate">
          {zoomPct ?? '—'}%
        </span>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomBy(1.25)}
          className="grid size-6 place-items-center rounded text-slate transition-colors hover:bg-carbon-high hover:text-bone"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {editMode && (
        <div className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-hairline bg-carbon/95 px-3 py-2 text-[12px] shadow-lg shadow-black/40 backdrop-blur-sm">
          {!isDrawing ? (
            <>
              <span className="font-medium text-bone">Edit mode</span>
              <span className="text-slate-dim">·</span>
              <span className="text-slate">
                Drag polygon to move. Click polygon to select. Drag white dots to
                move vertices. Click square between dots to insert vertex.
                Shift+click vertex to delete.
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsDrawing(true);
                  setDrawingPoints([]);
                }}
                className="ml-2 rounded-md border border-blueprint/40 bg-blueprint/15 px-2 py-1 text-[11px] font-medium text-blueprint-bright transition-colors hover:bg-blueprint/25"
              >
                + Add polygon
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-blueprint-bright">
                Drawing new polygon
              </span>
              <span className="text-slate-dim">·</span>
              <span className="text-slate">
                Click to place vertices. Enter to finish ({drawingPoints.length}
                {' '}placed, min 3). Esc to cancel.
              </span>
              <button
                type="button"
                onClick={finishDrawing}
                disabled={drawingPoints.length < 3}
                className="ml-2 rounded-md border border-status-accepted/40 bg-status-accepted/15 px-2 py-1 text-[11px] font-medium text-status-accepted transition-colors hover:bg-status-accepted/25 disabled:opacity-40"
              >
                Finish
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDrawing(false);
                  setDrawingPoints([]);
                }}
                className="rounded-md border border-hairline bg-carbon px-2 py-1 text-[11px] font-medium text-slate transition-colors hover:bg-carbon-high hover:text-bone"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
