'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DetailPanel } from '@/components/DetailPanel';
import { DetectionList } from '@/components/DetectionList';
import { ProcessingScreen } from '@/components/ProcessingScreen';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/lib/store';

const Viewer = dynamic(() => import('@/components/Viewer'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

const DEMO_TILE_SOURCE = '/demo/mep_hero.dzi';

export default function ProjectPage() {
  const params = useSearchParams();
  const job = useStore((s) => s.job);

  useEffect(() => {
    const scenario = params.get('demo');
    if (!scenario) return;
    const state = useStore.getState();
    if (state.job?.status === 'complete') return;
    state.setJob({
      id: 'demo-job-1',
      filename: 'Memorial_Hospital_MEP.pdf',
      status: 'processing',
      created_at: new Date().toISOString(),
    });
  }, [params]);

  if (!job || job.status === 'processing' || job.status === 'uploading') {
    return <ProcessingScreen scenario={params.get('demo') ?? 'mep_hero'} />;
  }

  if (job.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <Card className="max-w-md space-y-4 p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            Something went wrong
          </h1>
          <p className="text-sm text-zinc-500">
            We couldn&apos;t process this drawing. Try again.
          </p>
          <Button onClick={() => (window.location.href = '/')}>
            Back to upload
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white">
          <DetectionList />
        </aside>
        <main className="relative flex-1 overflow-hidden">
          <Viewer tileSource={DEMO_TILE_SOURCE} />
        </main>
        <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-zinc-200 bg-white">
          <DetailPanel />
        </aside>
      </div>
    </div>
  );
}
