import type { Polygon } from '@/lib/types';

const scenarios: Record<string, Polygon[]> = {};

export function loadDemoPolygons(scenario: string): Polygon[] {
  const polygons = scenarios[scenario];
  if (!polygons) {
    throw new Error(`Unknown demo scenario: ${scenario}`);
  }
  return polygons;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateProcessing(
  onStageChange: (stage: string, progress: number) => void,
): Promise<void> {
  await wait(1500);
  onStageChange('Extracting pages...', 15);
  await wait(1500);
  onStageChange('Running OCR...', 40);
  await wait(2000);
  onStageChange('Detecting rooms & components...', 70);
  await wait(1000);
  onStageChange('Vectorizing results...', 95);
  await wait(500);
}
