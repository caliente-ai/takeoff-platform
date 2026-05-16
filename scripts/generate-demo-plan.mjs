// Generates a synthetic hospital MEP floor plan as SVG, rasterizes to PNG,
// produces DZI tiles, and emits matching polygon JSON.
//
// Pixel-perfect alignment: the SVG room rectangles and the polygon coordinates
// are derived from the SAME bounding-box definitions. They cannot drift.
//
// Outputs:
//   apps/web/public/demo/mep_hero.png
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

const W = 4800;
const H = 3000;
const FT_PER_PX = 0.025;

const COLORS = {
  room: '#3b82f6',
  wall: '#6b7280',
  fixture: '#f59e0b',
  equipment: '#8b5cf6',
};

// ----------------------------------------------------------------------------
// Plan layout — every dimension below is the single source of truth used by
// both the SVG renderer and the polygon JSON generator.
// ----------------------------------------------------------------------------

// Outer building shell (inset 80px from canvas edge)
const SHELL = { x: 80, y: 80, w: W - 160, h: H - 160 };

// Main horizontal corridor through the middle
const CORRIDOR_Y = 1500;
const CORRIDOR_H = 220;

// Top wing: surgery suite (left) + patient rooms (right)
// Top sub-strip for support rooms above the main rooms
const TOP_SUPPORT_Y = 100;
const TOP_SUPPORT_H = 240;

const TOP_ROOMS_Y = TOP_SUPPORT_Y + TOP_SUPPORT_H; // 340
const TOP_ROOMS_H = CORRIDOR_Y - TOP_ROOMS_Y; // 1160

const BOTTOM_ROOMS_Y = CORRIDOR_Y + CORRIDOR_H; // 1720
const BOTTOM_ROOMS_H = 980;
const BOTTOM_SUPPORT_Y = BOTTOM_ROOMS_Y + BOTTOM_ROOMS_H; // 2700
const BOTTOM_SUPPORT_H = H - 80 - BOTTOM_SUPPORT_Y; // 220

const rooms = [
  // Top sub-strip — support rooms above main wing
  { x: 100, y: TOP_SUPPORT_Y, w: 320, h: TOP_SUPPORT_H, label: 'Reception' },
  { x: 420, y: TOP_SUPPORT_Y, w: 380, h: TOP_SUPPORT_H, label: 'Waiting Area' },
  { x: 800, y: TOP_SUPPORT_Y, w: 280, h: TOP_SUPPORT_H, label: 'Triage' },
  { x: 1080, y: TOP_SUPPORT_Y, w: 280, h: TOP_SUPPORT_H, label: 'Nurse Station N1' },
  { x: 1360, y: TOP_SUPPORT_Y, w: 320, h: TOP_SUPPORT_H, label: 'Records' },
  { x: 1680, y: TOP_SUPPORT_Y, w: 300, h: TOP_SUPPORT_H, label: 'Sterile Storage' },
  { x: 1980, y: TOP_SUPPORT_Y, w: 380, h: TOP_SUPPORT_H, label: 'Scrub Room' },
  { x: 2780, y: TOP_SUPPORT_Y, w: 480, h: TOP_SUPPORT_H, label: 'Conference Room' },
  { x: 3260, y: TOP_SUPPORT_Y, w: 460, h: TOP_SUPPORT_H, label: 'Staff Lounge' },
  { x: 3720, y: TOP_SUPPORT_Y, w: 480, h: TOP_SUPPORT_H, label: 'Locker Room' },
  { x: 4200, y: TOP_SUPPORT_Y, w: 500, h: TOP_SUPPORT_H, label: 'Director Office' },

  // Top main wing — Operating rooms (left), then exam rooms / labs
  { x: 100, y: TOP_ROOMS_Y, w: 600, h: TOP_ROOMS_H, label: 'Operating Room 1' },
  { x: 700, y: TOP_ROOMS_Y, w: 600, h: TOP_ROOMS_H, label: 'Operating Room 2' },
  { x: 1300, y: TOP_ROOMS_Y, w: 600, h: TOP_ROOMS_H, label: 'Operating Room 3' },
  { x: 1900, y: TOP_ROOMS_Y, w: 460, h: TOP_ROOMS_H, label: 'Recovery Bay' },
  { x: 2360, y: TOP_ROOMS_Y, w: 420, h: TOP_ROOMS_H, label: 'Pre-Op Holding' },

  // Top main wing — Exam rooms (right side, smaller)
  { x: 2780, y: TOP_ROOMS_Y, w: 380, h: 560, label: 'Exam Room A' },
  { x: 3160, y: TOP_ROOMS_Y, w: 380, h: 560, label: 'Exam Room B' },
  { x: 3540, y: TOP_ROOMS_Y, w: 380, h: 560, label: 'Exam Room C' },
  { x: 3920, y: TOP_ROOMS_Y, w: 380, h: 560, label: 'Exam Room D' },
  { x: 4300, y: TOP_ROOMS_Y, w: 400, h: 560, label: 'Imaging' },

  // Top wing — second sub-row under exam rooms
  { x: 2780, y: TOP_ROOMS_Y + 560, w: 540, h: 600, label: 'Pharmacy' },
  { x: 3320, y: TOP_ROOMS_Y + 560, w: 540, h: 600, label: 'Laboratory' },
  { x: 3860, y: TOP_ROOMS_Y + 560, w: 440, h: 600, label: 'Clean Utility' },
  { x: 4300, y: TOP_ROOMS_Y + 560, w: 400, h: 600, label: 'Soiled Utility' },

  // Bottom main wing — Patient rooms (8 across)
  { x: 100, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 101' },
  { x: 660, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 102' },
  { x: 1220, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 103' },
  { x: 1780, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 104' },
  { x: 2340, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 105' },
  { x: 2900, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 106' },
  { x: 3460, y: BOTTOM_ROOMS_Y, w: 560, h: BOTTOM_ROOMS_H, label: 'Patient Room 107' },
  { x: 4020, y: BOTTOM_ROOMS_Y, w: 680, h: BOTTOM_ROOMS_H, label: 'ICU Suite' },

  // Bottom sub-strip — support rooms below patient wing
  { x: 100, y: BOTTOM_SUPPORT_Y, w: 320, h: BOTTOM_SUPPORT_H, label: 'Nurse Station S1' },
  { x: 420, y: BOTTOM_SUPPORT_Y, w: 260, h: BOTTOM_SUPPORT_H, label: 'Med Room' },
  { x: 680, y: BOTTOM_SUPPORT_Y, w: 280, h: BOTTOM_SUPPORT_H, label: 'Linen Closet' },
  { x: 960, y: BOTTOM_SUPPORT_Y, w: 280, h: BOTTOM_SUPPORT_H, label: 'Equipment Bay' },
  { x: 1240, y: BOTTOM_SUPPORT_Y, w: 400, h: BOTTOM_SUPPORT_H, label: 'Family Lounge' },
];

// Small fixture-category rooms (toilets, utility closets)
const fixtures = [
  { x: 1680, y: BOTTOM_SUPPORT_Y, w: 160, h: BOTTOM_SUPPORT_H, label: 'Staff WC (Men)' },
  { x: 1840, y: BOTTOM_SUPPORT_Y, w: 160, h: BOTTOM_SUPPORT_H, label: 'Staff WC (Women)' },
  { x: 2000, y: BOTTOM_SUPPORT_Y, w: 160, h: BOTTOM_SUPPORT_H, label: 'Universal WC' },
  { x: 2160, y: BOTTOM_SUPPORT_Y, w: 160, h: BOTTOM_SUPPORT_H, label: 'Janitor Closet' },
  { x: 2320, y: BOTTOM_SUPPORT_Y, w: 160, h: BOTTOM_SUPPORT_H, label: 'Bio-Hazard' },
];

// Equipment / mechanical
const equipment = [
  { x: 2480, y: BOTTOM_SUPPORT_Y, w: 240, h: BOTTOM_SUPPORT_H, label: 'AHU-1' },
  { x: 2720, y: BOTTOM_SUPPORT_Y, w: 240, h: BOTTOM_SUPPORT_H, label: 'AHU-2' },
  { x: 2960, y: BOTTOM_SUPPORT_Y, w: 220, h: BOTTOM_SUPPORT_H, label: 'Electrical Panel' },
  { x: 3180, y: BOTTOM_SUPPORT_Y, w: 220, h: BOTTOM_SUPPORT_H, label: 'Fire Pump' },
  { x: 3400, y: BOTTOM_SUPPORT_Y, w: 1300, h: BOTTOM_SUPPORT_H, label: 'Loading Dock' },
];

// Wall segments — exterior shell + a few notable interior partitions
const walls = [
  // Exterior shell (4 sides)
  { x: SHELL.x, y: SHELL.y, w: SHELL.w, h: 18, label: 'North Exterior Wall' },
  { x: SHELL.x, y: SHELL.y + SHELL.h - 18, w: SHELL.w, h: 18, label: 'South Exterior Wall' },
  { x: SHELL.x, y: SHELL.y, w: 18, h: SHELL.h, label: 'West Exterior Wall' },
  { x: SHELL.x + SHELL.w - 18, y: SHELL.y, w: 18, h: SHELL.h, label: 'East Exterior Wall' },
  // Central corridor walls
  { x: SHELL.x, y: CORRIDOR_Y, w: SHELL.w, h: 14, label: 'Corridor Wall (North)' },
  { x: SHELL.x, y: CORRIDOR_Y + CORRIDOR_H - 14, w: SHELL.w, h: 14, label: 'Corridor Wall (South)' },
];

// ----------------------------------------------------------------------------
// SVG renderer — draws the plan from the room/fixture/wall/equipment lists
// ----------------------------------------------------------------------------

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rectFill = (r, fill, stroke, strokeWidth) =>
  `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

const centeredLabel = (r, primary, secondary, primarySize, secondarySize) => {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return (
    `<text x="${cx}" y="${cy - 4}" font-family="Helvetica, Arial, sans-serif" font-size="${primarySize}" font-weight="500" fill="#27272a" text-anchor="middle">${escapeXml(primary)}</text>` +
    `<text x="${cx}" y="${cy + secondarySize + 6}" font-family="Helvetica, Arial, sans-serif" font-size="${secondarySize}" font-weight="400" fill="#71717a" text-anchor="middle">${escapeXml(secondary)}</text>`
  );
};

const doorSwing = (cx, cy, radius, startAngle, sweep) => {
  // SVG arc path for door swing
  const rad = (a) => (a * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(rad(startAngle));
  const y1 = cy + radius * Math.sin(rad(startAngle));
  const x2 = cx + radius * Math.cos(rad(startAngle + sweep));
  const y2 = cy + radius * Math.sin(rad(startAngle + sweep));
  return `<path d="M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}" fill="none" stroke="#a1a1aa" stroke-width="1" /><line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="#a1a1aa" stroke-width="1" />`;
};

const titleBlock = () => {
  const x = W - 540;
  const y = H - 200;
  return (
    `<g>` +
    `<rect x="${x}" y="${y}" width="500" height="160" fill="white" stroke="#52525b" stroke-width="2" />` +
    `<line x1="${x}" y1="${y + 40}" x2="${x + 500}" y2="${y + 40}" stroke="#52525b" stroke-width="1" />` +
    `<text x="${x + 16}" y="${y + 28}" font-family="Helvetica" font-size="22" font-weight="600" fill="#18181b">MEMORIAL HOSPITAL — MEP PHASE 2</text>` +
    `<text x="${x + 16}" y="${y + 64}" font-family="Helvetica" font-size="14" fill="#52525b">Sheet M-101 · Level 1 Floor Plan</text>` +
    `<text x="${x + 16}" y="${y + 88}" font-family="Helvetica" font-size="14" fill="#52525b">Scale 1/8" = 1'-0"   ·   Issued 2026-05-16</text>` +
    `<text x="${x + 16}" y="${y + 122}" font-family="Helvetica" font-size="11" fill="#a1a1aa">DD-A2011 · Rev. C · TakeoffAI</text>` +
    `<text x="${x + 16}" y="${y + 144}" font-family="Helvetica" font-size="11" fill="#a1a1aa">DO NOT SCALE DRAWING · USE FIGURED DIMENSIONS</text>` +
    `</g>`
  );
};

const northArrow = () => {
  const cx = W - 200;
  const cy = 200;
  return (
    `<g transform="translate(${cx},${cy})">` +
    `<circle r="60" fill="white" stroke="#52525b" stroke-width="2" />` +
    `<path d="M 0 -42 L -16 30 L 0 16 L 16 30 Z" fill="#18181b" />` +
    `<text x="0" y="-52" font-family="Helvetica" font-size="18" font-weight="700" fill="#18181b" text-anchor="middle">N</text>` +
    `</g>`
  );
};

const scaleBar = () => {
  const x = 120;
  const y = H - 140;
  const segWidth = 80;
  return (
    `<g>` +
    `<rect x="${x}" y="${y}" width="${segWidth}" height="12" fill="#18181b" />` +
    `<rect x="${x + segWidth}" y="${y}" width="${segWidth}" height="12" fill="white" stroke="#18181b" stroke-width="1" />` +
    `<rect x="${x + segWidth * 2}" y="${y}" width="${segWidth}" height="12" fill="#18181b" />` +
    `<rect x="${x + segWidth * 3}" y="${y}" width="${segWidth}" height="12" fill="white" stroke="#18181b" stroke-width="1" />` +
    `<text x="${x}" y="${y + 30}" font-family="Helvetica" font-size="11" fill="#52525b">0</text>` +
    `<text x="${x + segWidth * 2}" y="${y + 30}" font-family="Helvetica" font-size="11" fill="#52525b" text-anchor="middle">10'</text>` +
    `<text x="${x + segWidth * 4}" y="${y + 30}" font-family="Helvetica" font-size="11" fill="#52525b" text-anchor="end">20'</text>` +
    `</g>`
  );
};

const buildSvg = () => {
  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
  );
  // Paper background
  parts.push(`<rect width="${W}" height="${H}" fill="#fafafa" />`);

  // Subtle drafting grid
  for (let x = 0; x <= W; x += 80) {
    parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#e4e4e7" stroke-width="0.5" />`);
  }
  for (let y = 0; y <= H; y += 80) {
    parts.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#e4e4e7" stroke-width="0.5" />`);
  }

  // Rooms (white with thin border + label)
  for (const r of rooms) {
    parts.push(rectFill(r, '#ffffff', '#71717a', 2));
    const sqft = Math.round(r.w * r.h * FT_PER_PX * FT_PER_PX);
    parts.push(centeredLabel(r, r.label, `${sqft} sq ft`, 22, 16));
  }

  // Fixtures (amber tint)
  for (const f of fixtures) {
    parts.push(rectFill(f, '#fef3c7', '#a16207', 2));
    parts.push(centeredLabel(f, f.label, '', 12, 0));
  }

  // Equipment (violet tint)
  for (const e of equipment) {
    parts.push(rectFill(e, '#ede9fe', '#6d28d9', 2));
    parts.push(centeredLabel(e, e.label, '', 16, 0));
  }

  // Walls (drawn over rooms so they sit on top)
  for (const w of walls) parts.push(rectFill(w, '#18181b', '#18181b', 0));

  // Door swings on each room (just for visual richness)
  for (const r of rooms) {
    // Place a door near top-center of each room
    const doorRadius = Math.min(60, r.w * 0.12);
    parts.push(doorSwing(r.x + r.w / 2, r.y + 18, doorRadius, 0, 90));
  }

  // North arrow, scale bar, title block
  parts.push(northArrow());
  parts.push(scaleBar());
  parts.push(titleBlock());

  parts.push(`</svg>`);
  return parts.join('');
};

// ----------------------------------------------------------------------------
// Polygon JSON — generated from the SAME rect definitions
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------

async function main() {
  await mkdir(PUBLIC_DEMO, { recursive: true });
  const tileBase = resolve(PUBLIC_DEMO, 'mep_hero');
  await rm(`${tileBase}.dzi`, { force: true });
  await rm(`${tileBase}_files`, { recursive: true, force: true });

  const svg = buildSvg();
  const pngPath = resolve(PUBLIC_DEMO, 'mep_hero.png');
  await sharp(Buffer.from(svg)).png().toFile(pngPath);

  await sharp(pngPath)
    .tile({ size: 256, overlap: 1, layout: 'dz' })
    .toFile(tileBase);

  const polygons = buildPolygons();
  await writeFile(
    resolve(PUBLIC_DEMO, 'mep_hero.json'),
    JSON.stringify(polygons, null, 2),
  );

  console.error(
    `wrote: mep_hero.png (${W}x${H}), DZI tiles, mep_hero.json (${polygons.length} polygons)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
