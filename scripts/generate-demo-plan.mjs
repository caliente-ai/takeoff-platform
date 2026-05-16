// Takes the rendered PDF page (Ripley Valley State School, page 9, Bldg Sec. K
// Level 1 Floor Plan) at apps/web/public/demo/mep_hero.png, produces DZI tiles,
// and emits hand-traced polygon JSON matching the visible rooms.
//
// Polygon coordinates were traced against a 25-pixel coordinate grid overlay
// on the 6623x4678 render. Zones: GLA strip (bottom), middle-left wing
// (Bridge/Data/Res Store/Practical Learning), admin/specialist strip + toilet
// cluster (middle-right).
//
// Re-run after dropping in a new PNG of the same dimensions:
//   pdftoppm -r 200 -f 9 -l 9 -png "demo-fixtures/Architectural Drawings 020520.pdf" /tmp/ripley
//   cp /tmp/ripley-09.png apps/web/public/demo/mep_hero.png
//   node scripts/generate-demo-plan.mjs

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DEMO = resolve(ROOT, 'apps/web/public/demo');
const SRC_PNG = resolve(PUBLIC_DEMO, 'mep_hero.png');

const FT_PER_PX = 0.025;

const COLORS = {
  room: '#3b82f6',
  wall: '#6b7280',
  fixture: '#f59e0b',
  equipment: '#8b5cf6',
};

// rect helper: returns a 4-vertex polygon points array for a bounding box.
// Use this for rectangular rooms. For irregular rooms, list points explicitly.
const rect = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

// Hand-traced polygons on the Ripley page 9 render (6623x4678).
// All coordinates are in original-image pixels.
const POLYGONS = [
  // ----- Bottom strip: 5 General Learning Areas -----
  { label: 'General Learning Area 1', category: 'room', points: rect(2360, 2485, 495, 670) },
  { label: 'General Learning Area 2', category: 'room', points: rect(2865, 2485, 490, 670) },
  { label: 'General Learning Area 3', category: 'room', points: rect(3365, 2485, 490, 670) },
  { label: 'General Learning Area 4', category: 'room', points: rect(3865, 2485, 490, 670) },
  { label: 'General Learning Area 5', category: 'room', points: rect(4365, 2485, 490, 670) },

  // ----- Middle-left wing: Bridge corridor + adjacent rooms -----
  { label: 'Practical Learning Area', category: 'room', points: rect(1880, 1500, 700, 480) },
  { label: 'Data', category: 'room', points: rect(640, 1980, 250, 245) },
  { label: 'Bridge', category: 'room', points: rect(890, 1980, 970, 245) },
  { label: 'Res Store', category: 'room', points: rect(1860, 1980, 240, 245) },
  { label: 'Stair (Up)', category: 'equipment', points: rect(930, 1650, 200, 260) },
  { label: 'Elevator', category: 'equipment', points: rect(1160, 1700, 110, 180) },

  // ----- Admin/specialist strip (top row, y ~ 1500-1830) -----
  { label: 'Office (North)', category: 'room', points: rect(2740, 1500, 240, 180) },
  { label: 'Learning & Activity Space', category: 'room', points: rect(2985, 1500, 460, 330) },
  { label: 'Team Interaction', category: 'room', points: rect(3445, 1500, 315, 330) },
  { label: 'Specialist Service & Therapy', category: 'room', points: rect(3760, 1500, 465, 330) },
  { label: 'Inter Room (NE)', category: 'room', points: rect(4225, 1500, 255, 240) },
  { label: 'Office (NE)', category: 'room', points: rect(4480, 1500, 250, 240) },

  // ----- Middle column on the left side -----
  { label: 'Inter Room (Mid)', category: 'room', points: rect(2980, 1680, 265, 220) },
  { label: 'Office (Mid)', category: 'room', points: rect(2980, 1900, 265, 220) },
  { label: 'Reception', category: 'room', points: rect(3245, 1830, 275, 330) },

  // ----- Toilet cluster (fixtures, amber) -----
  { label: 'PWD Assist WC', category: 'fixture', points: rect(3585, 1890, 235, 270) },
  { label: 'PWD / AHR', category: 'fixture', points: rect(3820, 1890, 140, 270) },
  { label: 'WC Staff', category: 'fixture', points: rect(3960, 1890, 140, 270) },
  { label: 'Universal WC', category: 'fixture', points: rect(4100, 1890, 140, 270) },
  { label: 'Cleaner / Laundry', category: 'fixture', points: rect(4400, 1830, 170, 290) },

  // ----- Far-east office + bottom corridor -----
  { label: 'Office (SE)', category: 'room', points: rect(4570, 1830, 160, 290) },
  { label: 'Breezeway', category: 'room', points: rect(3300, 2160, 730, 280) },
];

// ----- Derived field helpers -----

const shoelaceArea = (points) => {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
};

const perimeter = (points) => {
  let p = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    p += Math.hypot(x2 - x1, y2 - y1);
  }
  return p;
};

const seededConfidence = (i) => {
  const v = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  return Math.round((0.78 + Math.abs(v) * 0.2) * 100) / 100;
};

const buildPolygonsOutput = () => {
  const pad = (n) => String(n).padStart(3, '0');
  return POLYGONS.map((p, i) => {
    const area_px = shoelaceArea(p.points);
    const peri_px = perimeter(p.points);
    return {
      id: `det_${pad(i + 1)}`,
      label: p.label,
      category: p.category,
      status: 'pending',
      confidence: seededConfidence(i + 1),
      points: p.points,
      area_sqft: Math.round(area_px * FT_PER_PX * FT_PER_PX),
      perimeter_ft: Math.round(peri_px * FT_PER_PX * 10) / 10,
      color: COLORS[p.category],
    };
  });
};

// ----- Main -----

async function main() {
  await mkdir(PUBLIC_DEMO, { recursive: true });
  const tileBase = resolve(PUBLIC_DEMO, 'mep_hero');
  await rm(`${tileBase}.dzi`, { force: true });
  await rm(`${tileBase}_files`, { recursive: true, force: true });

  const meta = await sharp(SRC_PNG).metadata();

  await sharp(SRC_PNG)
    .tile({ size: 256, overlap: 1, layout: 'dz' })
    .toFile(tileBase);

  const polygons = buildPolygonsOutput();
  await writeFile(
    resolve(PUBLIC_DEMO, 'mep_hero.json'),
    JSON.stringify(polygons, null, 2),
  );

  console.error(
    `wrote: DZI tiles for ${meta.width}x${meta.height}, ${polygons.length} polygons`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
