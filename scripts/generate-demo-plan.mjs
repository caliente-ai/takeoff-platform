// Generates a synthetic floor plan PNG + DZI tiles + matching polygon JSON.
// Outputs:
//   apps/web/public/demo/mep_hero.png
//   apps/web/public/demo/mep_hero/mep_hero.dzi
//   apps/web/public/demo/mep_hero/mep_hero_files/...
//   apps/web/public/demo/mep_hero.json

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DEMO = resolve(ROOT, 'apps/web/public/demo');

const W = 2400;
const H = 1600;
const FT_PER_PX = 0.04;

const COLORS = {
  room: '#3b82f6',
  wall: '#6b7280',
  fixture: '#f59e0b',
  equipment: '#8b5cf6',
};

const rooms = [
  { x: 120, y: 120, w: 700, h: 360, label: 'Conference Room A' },
  { x: 840, y: 120, w: 700, h: 360, label: 'Office 101' },
  { x: 1560, y: 120, w: 720, h: 360, label: 'Office 102' },
  { x: 120, y: 500, w: 460, h: 320, label: 'Restroom M' },
  { x: 600, y: 500, w: 1680, h: 320, label: 'Corridor C1' },
  { x: 120, y: 840, w: 700, h: 360, label: 'Mechanical Room' },
  { x: 840, y: 840, w: 700, h: 360, label: 'Server Room' },
  { x: 1560, y: 840, w: 720, h: 360, label: 'Electrical Room' },
  { x: 120, y: 1220, w: 600, h: 260, label: 'Reception' },
  { x: 740, y: 1220, w: 700, h: 260, label: 'Break Room' },
  { x: 1460, y: 1220, w: 480, h: 260, label: 'Storage' },
  { x: 1960, y: 1220, w: 320, h: 260, label: 'Stairwell A' },
];

const WALL_T = 18;
const walls = [
  { x: 120, y: 102, w: 2160, h: WALL_T, label: 'North Wall' },
  { x: 120, y: 1480, w: 2160, h: WALL_T, label: 'South Wall' },
  { x: 102, y: 120, w: WALL_T, h: 1360, label: 'West Wall' },
  { x: 2280, y: 120, w: WALL_T, h: 1360, label: 'East Wall' },
  { x: 820, y: 120, w: WALL_T, h: 380, label: 'Partition N1' },
  { x: 1540, y: 120, w: WALL_T, h: 380, label: 'Partition N2' },
  { x: 580, y: 500, w: WALL_T, h: 320, label: 'Partition C1' },
  { x: 820, y: 840, w: WALL_T, h: 360, label: 'Partition S1' },
];

const fixtures = [
  { x: 270, y: 240, w: 60, h: 60, label: 'Light Fixture 1' },
  { x: 590, y: 240, w: 60, h: 60, label: 'Light Fixture 2' },
  { x: 1010, y: 240, w: 60, h: 60, label: 'Light Fixture 3' },
  { x: 1330, y: 240, w: 60, h: 60, label: 'Light Fixture 4' },
  { x: 1730, y: 240, w: 60, h: 60, label: 'Light Fixture 5' },
  { x: 2050, y: 240, w: 60, h: 60, label: 'Light Fixture 6' },
];

const equipment = [
  { x: 200, y: 940, w: 240, h: 160, label: 'AHU-1' },
  { x: 500, y: 940, w: 200, h: 160, label: 'VAV Box 2' },
  { x: 920, y: 940, w: 180, h: 220, label: 'Fire Panel' },
  { x: 1640, y: 940, w: 240, h: 200, label: 'Electrical Panel' },
];

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderRect = (r, fill, stroke, strokeWidth) =>
  `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;

const renderRoomLabel = (r) => {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return `<text x="${cx}" y="${cy}" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="500" fill="#3f3f46" text-anchor="middle" dominant-baseline="central">${escapeXml(r.label)}</text>`;
};

const renderEquipLabel = (r) => {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return `<text x="${cx}" y="${cy}" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="600" fill="#581c87" text-anchor="middle" dominant-baseline="central">${escapeXml(r.label)}</text>`;
};

const buildSvg = () => {
  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
  );
  parts.push(`<rect width="${W}" height="${H}" fill="#fafafa" />`);

  for (let x = 0; x <= W; x += 80) {
    parts.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#e4e4e7" stroke-width="0.5" />`,
    );
  }
  for (let y = 0; y <= H; y += 80) {
    parts.push(
      `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#e4e4e7" stroke-width="0.5" />`,
    );
  }

  for (const r of rooms) {
    parts.push(renderRect(r, '#ffffff', '#a1a1aa', 1.5));
    parts.push(renderRoomLabel(r));
  }
  for (const w of walls) parts.push(renderRect(w, '#27272a', '#27272a', 0));
  for (const f of fixtures) {
    parts.push(renderRect(f, '#fef3c7', '#a16207', 1.5));
    parts.push(
      `<circle cx="${f.x + f.w / 2}" cy="${f.y + f.h / 2}" r="14" fill="none" stroke="#a16207" stroke-width="1.5" />`,
    );
  }
  for (const e of equipment) {
    parts.push(renderRect(e, '#ede9fe', '#6d28d9', 2));
    parts.push(renderEquipLabel(e));
  }

  parts.push(
    `<g transform="translate(${W - 360},${H - 120})">` +
      `<rect x="0" y="0" width="320" height="80" fill="#ffffff" stroke="#71717a" stroke-width="1.5" />` +
      `<text x="160" y="32" font-family="Helvetica" font-size="14" fill="#52525b" text-anchor="middle">MEMORIAL HOSPITAL — MEP PLAN</text>` +
      `<text x="160" y="56" font-family="Helvetica" font-size="11" fill="#a1a1aa" text-anchor="middle">Sheet M-101 · Scale 1/8" = 1'-0"</text>` +
      `</g>`,
  );

  parts.push(`</svg>`);
  return parts.join('');
};

const rectPoints = (r) => [
  [r.x, r.y],
  [r.x + r.w, r.y],
  [r.x + r.w, r.y + r.h],
  [r.x, r.y + r.h],
];

const rectArea = (r) => r.w * r.h * FT_PER_PX * FT_PER_PX;
const rectPerimeter = (r) => 2 * (r.w + r.h) * FT_PER_PX;

const seededConfidence = (i) => {
  const base = 0.78;
  const v = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  return Math.round((base + Math.abs(v) * 0.2) * 100) / 100;
};

const buildPolygons = () => {
  const out = [];
  let i = 1;
  const pad = (n) => String(n).padStart(3, '0');

  for (const r of rooms) {
    out.push({
      id: `det_${pad(i)}`,
      label: r.label,
      category: 'room',
      status: 'pending',
      confidence: seededConfidence(i),
      points: rectPoints(r),
      area_sqft: Math.round(rectArea(r)),
      perimeter_ft: Math.round(rectPerimeter(r) * 10) / 10,
      color: COLORS.room,
    });
    i++;
  }
  for (const r of walls) {
    out.push({
      id: `det_${pad(i)}`,
      label: r.label,
      category: 'wall',
      status: 'pending',
      confidence: seededConfidence(i),
      points: rectPoints(r),
      area_sqft: Math.round(rectArea(r)),
      perimeter_ft: Math.round(rectPerimeter(r) * 10) / 10,
      color: COLORS.wall,
    });
    i++;
  }
  for (const r of fixtures) {
    out.push({
      id: `det_${pad(i)}`,
      label: r.label,
      category: 'fixture',
      status: 'pending',
      confidence: seededConfidence(i),
      points: rectPoints(r),
      area_sqft: Math.round(rectArea(r) * 10) / 10,
      perimeter_ft: Math.round(rectPerimeter(r) * 10) / 10,
      color: COLORS.fixture,
    });
    i++;
  }
  for (const r of equipment) {
    out.push({
      id: `det_${pad(i)}`,
      label: r.label,
      category: 'equipment',
      status: 'pending',
      confidence: seededConfidence(i),
      points: rectPoints(r),
      area_sqft: Math.round(rectArea(r)),
      perimeter_ft: Math.round(rectPerimeter(r) * 10) / 10,
      color: COLORS.equipment,
    });
    i++;
  }
  return out;
};

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
    `wrote: mep_hero.png (${W}x${H}), mep_hero.dzi, mep_hero.json (${polygons.length} polygons)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
