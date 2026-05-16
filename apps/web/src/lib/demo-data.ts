import type { Polygon } from '@/lib/types';

const FALLBACK_POLYGONS: Polygon[] = [
  {
    id: 'det_fallback_1',
    label: 'Room A',
    category: 'room',
    status: 'pending',
    confidence: 0.92,
    points: [
      [200, 200],
      [800, 200],
      [800, 600],
      [200, 600],
    ],
    area_sqft: 240,
    perimeter_ft: 80,
    color: '#3b82f6',
  },
  {
    id: 'det_fallback_2',
    label: 'Room B',
    category: 'room',
    status: 'pending',
    confidence: 0.87,
    points: [
      [900, 200],
      [1500, 200],
      [1500, 600],
      [900, 600],
    ],
    area_sqft: 240,
    perimeter_ft: 80,
    color: '#3b82f6',
  },
  {
    id: 'det_fallback_3',
    label: 'Wall 1',
    category: 'wall',
    status: 'pending',
    confidence: 0.95,
    points: [
      [800, 200],
      [900, 200],
      [900, 600],
      [800, 600],
    ],
    area_sqft: 10,
    perimeter_ft: 50,
    color: '#6b7280',
  },
  {
    id: 'det_fallback_4',
    label: 'Light Fixture 1',
    category: 'fixture',
    status: 'pending',
    confidence: 0.81,
    points: [
      [400, 350],
      [460, 350],
      [460, 410],
      [400, 410],
    ],
    area_sqft: 4,
    perimeter_ft: 8,
    color: '#f59e0b',
  },
  {
    id: 'det_fallback_5',
    label: 'AHU-1',
    category: 'equipment',
    status: 'pending',
    confidence: 0.89,
    points: [
      [1100, 350],
      [1250, 350],
      [1250, 500],
      [1100, 500],
    ],
    area_sqft: 25,
    perimeter_ft: 24,
    color: '#8b5cf6',
  },
];

export async function loadDemoPolygons(scenario: string): Promise<Polygon[]> {
  try {
    const res = await fetch(`/demo/${scenario}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error('Bad JSON shape');
    return data as Polygon[];
  } catch (err) {
    console.error('loadDemoPolygons failed, using fallback', err);
    return FALLBACK_POLYGONS;
  }
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateProcessing(
  onStageChange: (stage: string, progress: number) => void,
): Promise<void> {
  await wait(1500);
  onStageChange('Extracting pages...', 15);
  await wait(1500);
  onStageChange('Running optical character recognition...', 40);
  await wait(2000);
  onStageChange('Detecting rooms & components...', 70);
  await wait(1000);
  onStageChange('Vectorizing results...', 95);
  await wait(500);
}
