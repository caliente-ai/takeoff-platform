'use client';

import { useEffect, useState } from 'react';
import { Eye, FileText, Shapes, Sparkles, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { loadDemoPolygons, simulateProcessing } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

type Stage = { label: string; icon: LucideIcon; progress: number };

const STAGES: Stage[] = [
  { label: 'Extracting pages...', icon: FileText, progress: 15 },
  { label: 'Running optical character recognition...', icon: Eye, progress: 40 },
  { label: 'Detecting rooms & components...', icon: Sparkles, progress: 70 },
  { label: 'Vectorizing results...', icon: Shapes, progress: 95 },
];

const stageIndexForProgress = (p: number): number => {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (p >= STAGES[i].progress) return i;
  }
  return 0;
};

type Props = { scenario?: string };

export function ProcessingScreen({ scenario = 'mep_hero' }: Props) {
  const filename = useStore((s) => s.job?.filename);

  const [stage, setStage] = useState<string>('Starting...');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await simulateProcessing((s, p) => {
          if (cancelled) return;
          setStage(s);
          setProgress(p);
        });
        if (cancelled) return;
        const polygons = await loadDemoPolygons(scenario);
        if (cancelled) return;
        const state = useStore.getState();
        state.loadPolygons(polygons);
        const current = state.job;
        if (current) {
          state.setJob({
            ...current,
            status: 'complete',
            progress: 100,
            polygon_count: polygons.length,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Processing failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scenario]);

  const activeIndex = stageIndexForProgress(progress);
  const ActiveIcon = STAGES[activeIndex].icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <Card className="relative w-full max-w-lg overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-blue-50/40 via-transparent to-emerald-50/40" />
        <div className="relative space-y-6">
          <p className="truncate text-sm text-zinc-500">
            {filename ?? 'Untitled document'}
          </p>
          <div className="flex items-start gap-3">
            <ActiveIcon className="mt-1 size-6 shrink-0 text-blue-600" />
            <h1
              key={stage}
              className="animate-in fade-in text-xl font-semibold text-zinc-900 duration-200"
            >
              {stage}
            </h1>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-zinc-400">
              Stage {activeIndex + 1} of {STAGES.length}
            </p>
          </div>
          <p className="text-xs text-zinc-400">
            This usually takes 10–15 seconds.
          </p>
        </div>
      </Card>
    </div>
  );
}
