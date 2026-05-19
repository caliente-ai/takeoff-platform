import { rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Polygon } from '@/lib/types';

const ALLOWED_SCENARIOS = new Set(['mep_hero']);

const isPoint = (v: unknown): v is [number, number] =>
  Array.isArray(v) &&
  v.length === 2 &&
  typeof v[0] === 'number' &&
  typeof v[1] === 'number';

const isPolygon = (v: unknown): v is Polygon => {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.label === 'string' &&
    typeof p.category === 'string' &&
    typeof p.status === 'string' &&
    typeof p.confidence === 'number' &&
    Array.isArray(p.points) &&
    p.points.length >= 3 &&
    p.points.every(isPoint) &&
    typeof p.area_sqft === 'number' &&
    typeof p.perimeter_ft === 'number' &&
    typeof p.color === 'string'
  );
};

export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'Saving to disk is only available in dev mode.' },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    scenario?: unknown;
    polygons?: unknown;
    allowEmpty?: unknown;
  } | null;

  const scenario = typeof body?.scenario === 'string' ? body.scenario : null;
  if (!scenario || !ALLOWED_SCENARIOS.has(scenario)) {
    return Response.json({ error: 'Invalid scenario.' }, { status: 400 });
  }

  if (!Array.isArray(body?.polygons) || !body.polygons.every(isPolygon)) {
    return Response.json({ error: 'Invalid polygons payload.' }, { status: 400 });
  }

  const polygons = body.polygons as Polygon[];
  if (polygons.length === 0 && body.allowEmpty !== true) {
    return Response.json(
      { error: 'Refusing to save empty polygon list. Pass allowEmpty:true to confirm.' },
      { status: 400 },
    );
  }

  const target = resolve(process.cwd(), 'public', 'demo', `${scenario}.json`);
  const tmp = `${target}.tmp`;
  await writeFile(tmp, JSON.stringify(polygons, null, 2));
  await rename(tmp, target);

  return Response.json({ ok: true, count: polygons.length, path: target });
}
