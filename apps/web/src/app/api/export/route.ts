import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import type { DetectionStatus, Polygon } from '@/lib/types';

type Override = { id: string; status: DetectionStatus };

const csvEscape = (v: string | number): string => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const HEADERS = [
  'ID',
  'Label',
  'Category',
  'Status',
  'Area (sqft)',
  'Perimeter (ft)',
  'Confidence',
  'Vertices',
];

const toRow = (p: Polygon): string =>
  [
    p.id,
    p.label,
    p.category,
    p.status,
    p.area_sqft,
    p.perimeter_ft,
    p.confidence,
    p.points.length,
  ]
    .map(csvEscape)
    .join(',');

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as {
    overrides?: Override[];
    statusFilter?: DetectionStatus | 'all';
  };

  const scenarioPath = join(
    process.cwd(),
    'public',
    'demo',
    'mep_hero.json',
  );
  const raw = await readFile(scenarioPath, 'utf-8').catch(() => null);
  if (!raw) {
    return NextResponse.json({ error: 'scenario not found' }, { status: 404 });
  }
  const basePolygons = JSON.parse(raw) as Polygon[];

  const overrideMap = new Map<string, DetectionStatus>();
  for (const o of body.overrides ?? []) overrideMap.set(o.id, o.status);

  const merged: Polygon[] = basePolygons
    .map((p) => {
      const override = overrideMap.get(p.id);
      return override ? { ...p, status: override } : p;
    })
    .filter((p) => {
      if (!body.overrides) return true;
      return overrideMap.has(p.id);
    });

  const filter = body.statusFilter ?? 'accepted';
  const filtered =
    filter === 'all' ? merged : merged.filter((p) => p.status === filter);

  const csv = [HEADERS.join(','), ...filtered.map(toRow)].join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="takeoff-export.csv"',
    },
  });
}
