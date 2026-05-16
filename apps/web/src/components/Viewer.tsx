'use client';

import { useEffect, useRef, useState } from 'react';
import type OpenSeadragonNS from 'openseadragon';
import { useStore } from '@/lib/store';
import type { DetectionStatus, Polygon } from '@/lib/types';

type Props = { tileSource: string };

const SVG_NS = 'http://www.w3.org/2000/svg';

const STATUS_COLOR: Record<DetectionStatus, string> = {
  pending: '#3b82f6',
  accepted: '#10b981',
  rejected: '#f43f5e',
};

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

export default function Viewer({ tileSource }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragonNS.Viewer | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const osdRef = useRef<typeof OpenSeadragonNS | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const polygons = useStore((s) => s.polygons);
  const selectedId = useStore((s) => s.selectedPolygonId);

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
        showNavigationControl: true,
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
    if (!svg || !isOpen) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const sorted = [...polygons].sort(
      (a, b) => CATEGORY_Z[a.category] - CATEGORY_Z[b.category],
    );

    for (const p of sorted) {
      const color = STATUS_COLOR[p.status];
      const isSelected = p.id === selectedId;
      const baseOpacity = isSelected ? 0.35 : 0.18;

      const el = document.createElementNS(SVG_NS, 'polygon');
      el.setAttribute('points', p.points.map((pt) => pt.join(',')).join(' '));
      el.setAttribute('fill', color);
      el.setAttribute('fill-opacity', String(baseOpacity));
      el.setAttribute('stroke', color);
      el.setAttribute('stroke-width', isSelected ? '4' : '2');
      el.style.cursor = 'pointer';
      el.style.transition = 'fill-opacity 120ms ease';
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
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = `${p.label} (${Math.round(p.confidence * 100)}%)`;
      el.appendChild(title);
      svg.appendChild(el);
    }
  }, [polygons, selectedId, isOpen]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isOpen || !selectedId) return;
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
  }, [selectedId, polygons, isOpen]);

  return <div ref={containerRef} className="absolute inset-0 bg-zinc-100" />;
}
