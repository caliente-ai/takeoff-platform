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

// Coordinates measured against fine 50-pixel grid overlays on the 6623x4678 render.
const rooms = [
  // Bottom strip: 5 General Learning Areas (~500 wide each)
  { x: 2355, y: 2485, w: 500, h: 685, label: 'General Learning Area 1' },
  { x: 2855, y: 2485, w: 500, h: 685, label: 'General Learning Area 2' },
  { x: 3355, y: 2485, w: 500, h: 685, label: 'General Learning Area 3' },
  { x: 3855, y: 2485, w: 500, h: 685, label: 'General Learning Area 4' },
  { x: 4355, y: 2485, w: 500, h: 685, label: 'General Learning Area 5' },

  // Middle-left strip
  { x: 1750, y: 1500, w: 900, h: 450, label: 'Practical Learning Area' },
  { x: 850, y: 1980, w: 900, h: 300, label: 'Bridge' },
  { x: 600, y: 2000, w: 250, h: 280, label: 'Data' },
  { x: 1860, y: 1980, w: 250, h: 300, label: 'Res Store' },

  // Top admin/specialist strip (left to right) — y ~1500-1700
  { x: 2750, y: 1500, w: 250, h: 200, label: 'Office (Admin North)' },
  { x: 3050, y: 1500, w: 450, h: 350, label: 'Learning & Activity Space' },
  { x: 3500, y: 1500, w: 300, h: 350, label: 'Team Interaction' },
  { x: 3800, y: 1500, w: 450, h: 350, label: 'Specialist Service & Therapy' },
  { x: 4250, y: 1500, w: 250, h: 250, label: 'Inter Room (North)' },
  { x: 4500, y: 1500, w: 250, h: 250, label: 'Office (North-East)' },

  // Middle admin strip — y ~1750-1950
  { x: 2950, y: 1750, w: 300, h: 200, label: 'Inter Room (Center)' },

  // Lower admin strip — y ~1850-2150
  { x: 2950, y: 1950, w: 300, h: 200, label: 'Office (Center)' },
  { x: 3250, y: 1850, w: 300, h: 300, label: 'Reception' },
  { x: 4400, y: 1850, w: 150, h: 250, label: 'Cleaner / Laundry' },
  { x: 4550, y: 1850, w: 200, h: 250, label: 'Office (South-East)' },

  // Bottom corridor
  { x: 3300, y: 2200, w: 700, h: 280, label: 'Breezeway' },
];

// Small toilet cluster — fixture category
const fixtures = [
  { x: 3600, y: 1900, w: 200, h: 250, label: 'PWD Assist WC' },
  { x: 3800, y: 1900, w: 150, h: 250, label: 'PWD / AHR' },
  { x: 3950, y: 1900, w: 150, h: 250, label: 'WC Staff' },
  { x: 4100, y: 1900, w: 150, h: 250, label: 'Universal WC' },
];

// Walls (using GLA partitions which are clearly visible)
const walls = [
  { x: 1700, y: 2470, w: 3200, h: 25, label: 'Classroom Corridor Wall' },
  { x: 2840, y: 2485, w: 20, h: 685, label: 'Partition GLA 1/2' },
  { x: 3340, y: 2485, w: 20, h: 685, label: 'Partition GLA 2/3' },
  { x: 3840, y: 2485, w: 20, h: 685, label: 'Partition GLA 3/4' },
  { x: 4340, y: 2485, w: 20, h: 685, label: 'Partition GLA 4/5' },
];

// Circulation / mechanical
const equipment = [
  { x: 900, y: 1650, w: 200, h: 280, label: 'Stair (Up)' },
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
