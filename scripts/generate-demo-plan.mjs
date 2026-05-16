// Takes the real Ripley page-9 floor plan PNG, generates DZI tiles, and emits
// the polygon JSON for the demo. Polygon coordinates are hand-traced approximations
// of the rooms visible on the rendered plan.
//
// Outputs:
//   apps/web/public/demo/mep_hero.dzi
//   apps/web/public/demo/mep_hero_files/...
//   apps/web/public/demo/mep_hero.json
//
// Run: node scripts/generate-demo-plan.mjs

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DEMO = resolve(ROOT, 'apps/web/public/demo');
const SRC_PNG = resolve(PUBLIC_DEMO, 'mep_hero.png');

const COLORS = {
  room: '#3b82f6',
  wall: '#6b7280',
  fixture: '#f59e0b',
  equipment: '#8b5cf6',
};

// Floor plan layout: real image is ~6623 x 4678 pixels.
// Building active area roughly x: 800-5400, y: 950-3300.
// Rooms below are bounding-box approximations of the visible rooms.

// Coordinates measured against a 200px grid overlay on the 6623x4678 render.
const rooms = [
  // Bottom strip: 5 General Learning Areas (classrooms with curved fronts)
  { x: 2350, y: 2500, w: 480, h: 700, label: 'General Learning Area 1' },
  { x: 2840, y: 2500, w: 480, h: 700, label: 'General Learning Area 2' },
  { x: 3330, y: 2500, w: 480, h: 700, label: 'General Learning Area 3' },
  { x: 3820, y: 2500, w: 480, h: 700, label: 'General Learning Area 4' },
  { x: 4310, y: 2500, w: 480, h: 700, label: 'General Learning Area 5' },

  // Middle strip — Practical Learning Area + adjacent rooms
  { x: 1700, y: 1300, w: 900, h: 600, label: 'Practical Learning Area' },
  { x: 400, y: 1500, w: 900, h: 600, label: 'Bridge' },
  { x: 1900, y: 1900, w: 300, h: 300, label: 'Res Store' },
  { x: 100, y: 1900, w: 200, h: 300, label: 'Data' },

  // Top admin strip (left to right)
  { x: 2800, y: 1800, w: 200, h: 250, label: 'Office (Admin)' },
  { x: 3000, y: 1800, w: 400, h: 300, label: 'Learning & Activity Space' },
  { x: 3400, y: 1800, w: 300, h: 300, label: 'Team Interaction' },
  { x: 3700, y: 1800, w: 300, h: 300, label: 'Specialist Service & Therapy' },
  { x: 4000, y: 1800, w: 300, h: 250, label: 'Inter Room' },
  { x: 4300, y: 1800, w: 300, h: 250, label: 'Office (East)' },
  { x: 4600, y: 1800, w: 300, h: 250, label: 'Office (Far East)' },

  // Lower admin strip
  { x: 2800, y: 2050, w: 200, h: 250, label: 'Inter Room (Lower)' },
  { x: 2800, y: 2300, w: 200, h: 200, label: 'Office (Lower)' },
  { x: 3000, y: 2200, w: 300, h: 300, label: 'Reception' },
  { x: 3300, y: 2400, w: 600, h: 200, label: 'Breezeway' },
];

// Small toilet/utility rooms — fixture category, light amber
const fixtures = [
  { x: 3500, y: 2300, w: 200, h: 200, label: 'PWD Assist WC' },
  { x: 3700, y: 2300, w: 200, h: 200, label: 'PWD / AHR' },
  { x: 3900, y: 2300, w: 200, h: 200, label: 'WC Staff' },
  { x: 4100, y: 2300, w: 200, h: 200, label: 'Universal WC' },
  { x: 4500, y: 2300, w: 200, h: 200, label: 'Cleaner / Laundry' },
];

// Major walls — using horizontal partition lines for the classroom front
const walls = [
  { x: 1700, y: 2480, w: 3590, h: 25, label: 'Classroom-Side Corridor Wall' },
  { x: 2830, y: 2500, w: 15, h: 700, label: 'Partition GLA 1/2' },
  { x: 3320, y: 2500, w: 15, h: 700, label: 'Partition GLA 2/3' },
  { x: 3810, y: 2500, w: 15, h: 700, label: 'Partition GLA 3/4' },
  { x: 4300, y: 2500, w: 15, h: 700, label: 'Partition GLA 4/5' },
];

// Major equipment / circulation cores
const equipment = [
  { x: 400, y: 1300, w: 300, h: 200, label: 'Stairs Up' },
  { x: 4700, y: 2300, w: 200, h: 200, label: 'Office (CLNR adjacent)' },
];

const FT_PER_PX = 0.012;

const rectPoints = (r) => [
  [r.x, r.y],
  [r.x + r.w, r.y],
  [r.x + r.w, r.y + r.h],
  [r.x, r.y + r.h],
];

const rectArea = (r) => r.w * r.h * FT_PER_PX * FT_PER_PX;
const rectPerimeter = (r) => 2 * (r.w + r.h) * FT_PER_PX;

const seededConfidence = (i) => {
  const v = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  return Math.round((0.78 + Math.abs(v) * 0.2) * 100) / 100;
};

const buildPolygons = () => {
  const out = [];
  let i = 1;
  const pad = (n) => String(n).padStart(3, '0');
  const push = (group, category, areaPrecise = false) => {
    for (const r of group) {
      out.push({
        id: `det_${pad(i)}`,
        label: r.label,
        category,
        status: 'pending',
        confidence: seededConfidence(i),
        points: rectPoints(r),
        area_sqft: areaPrecise
          ? Math.round(rectArea(r) * 10) / 10
          : Math.round(rectArea(r)),
        perimeter_ft: Math.round(rectPerimeter(r) * 10) / 10,
        color: COLORS[category],
      });
      i++;
    }
  };
  push(rooms, 'room');
  push(walls, 'wall');
  push(fixtures, 'fixture', true);
  push(equipment, 'equipment');
  return out;
};

async function main() {
  await mkdir(PUBLIC_DEMO, { recursive: true });
  const tileBase = resolve(PUBLIC_DEMO, 'mep_hero');
  await rm(`${tileBase}.dzi`, { force: true });
  await rm(`${tileBase}_files`, { recursive: true, force: true });

  await sharp(SRC_PNG)
    .tile({ size: 256, overlap: 1, layout: 'dz' })
    .toFile(tileBase);

  const polygons = buildPolygons();
  await writeFile(
    resolve(PUBLIC_DEMO, 'mep_hero.json'),
    JSON.stringify(polygons, null, 2),
  );

  const meta = await sharp(SRC_PNG).metadata();
  console.error(
    `wrote: tiles for ${meta.width}x${meta.height}, ${polygons.length} polygons`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
