type Props = { seed: number };

// Ink canvas with blueprint line work — the "drawing blue" motif.
const PALETTES = [
  { bg: '#0b0c10', line: '#3b82f6' },
  { bg: '#14161c', line: '#5b9bff' },
  { bg: '#0b0c10', line: '#5b9bff' },
  { bg: '#14161c', line: '#3b82f6' },
];

function lineSet(seed: number) {
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    const x = ((seed * 47 + i * 13) % 100) + 5;
    out.push(`<line x1="${x}" y1="5" x2="${x}" y2="115" stroke="currentColor" stroke-width="0.5" />`);
  }
  for (let i = 0; i < 5; i++) {
    const y = ((seed * 31 + i * 11) % 90) + 15;
    out.push(`<line x1="5" y1="${y}" x2="395" y2="${y}" stroke="currentColor" stroke-width="0.5" />`);
  }
  for (let i = 0; i < 4; i++) {
    const x = ((seed * 19 + i * 41) % 320) + 30;
    const y = ((seed * 23 + i * 17) % 60) + 25;
    const w = 30 + ((seed + i * 7) % 60);
    const h = 20 + ((seed + i * 11) % 30);
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="0.7" />`);
  }
  return out.join('');
}

export function ProjectThumbnail({ seed }: Props) {
  const palette = PALETTES[seed % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice"><rect width="400" height="120" fill="${palette.bg}" /><g style="color:${palette.line}; opacity: 0.5;">${lineSet(seed)}</g></svg>`;
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return (
    <div
      className="h-32 w-full bg-ink bg-cover bg-center"
      style={{ backgroundImage: `url("${dataUrl}")` }}
      aria-hidden
    />
  );
}
