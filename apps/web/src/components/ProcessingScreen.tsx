'use client';

import { useEffect, useState } from 'react';
import { Eye, FileText, Shapes, Sparkles, type LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { loadDemoPolygons, simulateProcessing } from '@/lib/demo-data';
import { useStore } from '@/lib/store';

type Stage = { label: string; icon: LucideIcon; progress: number };

const STAGES: Stage[] = [
  { label: 'Extracting pages...', icon: FileText, progress: 15 },
  { label: 'Running optical character recognition...', icon: Eye, progress: 40 },
  { label: 'Detecting rooms and components...', icon: Sparkles, progress: 70 },
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Cinematic glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[460px] w-[460px] -translate-x-1/2 glow-ember" />
      <div className="pointer-events-none absolute bottom-1/5 left-1/3 h-[400px] w-[400px] glow-blueprint" />

      <div className="rise-in relative w-full max-w-xl">
        <p className="eyebrow mb-4 text-center">AI takeoff in progress</p>

        {/* Product window */}
        <div className="overflow-hidden rounded-2xl border border-hairline bg-carbon shadow-2xl shadow-black/50">
          <div className="flex items-center gap-1.5 border-b border-hairline bg-carbon-high px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-hairline-bright" />
            <span className="size-2.5 rounded-full bg-hairline-bright" />
            <span className="size-2.5 rounded-full bg-ember" />
            <span className="ml-2 font-mono text-[11px] tracking-wide text-slate-dim">
              app.caliente-ai.com
            </span>
          </div>

          <div className="space-y-6 p-8">
            <p className="truncate font-mono text-xs text-slate-dim">
              {filename ?? 'Untitled document'}
            </p>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-ember/15">
                <ActiveIcon className="size-5 text-ember" />
              </span>
              <h1
                key={stage}
                className="animate-in fade-in font-display text-2xl font-semibold text-bone duration-200"
              >
                {stage}
              </h1>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-dim">
                <span>
                  Stage {activeIndex + 1} of {STAGES.length}
                </span>
                <span>{progress}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-dim">
              This usually takes 10 to 15 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
