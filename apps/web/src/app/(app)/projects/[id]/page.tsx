'use client';

import { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DetailPanel } from '@/components/DetailPanel';
import { DetectionList } from '@/components/DetectionList';
import { ExportButton } from '@/components/ExportButton';
import { ProcessingScreen } from '@/components/ProcessingScreen';
import { PROJECTS } from '@/lib/projects';
import { useStore } from '@/lib/store';

const Viewer = dynamic(() => import('@/components/Viewer'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

const DEMO_TILE_SOURCE = '/demo/mep_hero.dzi';

function ProjectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const routeParams = useParams<{ id: string }>();
  const job = useStore((s) => s.job);
  const stats = useStore(useShallow((s) => s.getStats()));
  const scenario = params.get('demo') ?? 'mep_hero';

  const projectMeta = PROJECTS.find((p) => p.id === routeParams?.id) ?? PROJECTS[0];

  useEffect(() => {
    const demoParam = params.get('demo');
    if (!demoParam) return;
    const state = useStore.getState();
    if (state.job?.status === 'complete') return;
    state.setJob({
      id: routeParams?.id ?? 'demo-job-1',
      filename: `${projectMeta.name}.pdf`,
      status: 'processing',
      created_at: new Date().toISOString(),
    });
  }, [params, routeParams?.id, projectMeta.name]);

  if (!job || job.status === 'processing' || job.status === 'uploading') {
    return <ProcessingScreen scenario={scenario} />;
  }

  if (job.status === 'error') {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <Card className="max-w-md space-y-4 p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            Something went wrong
          </h1>
          <p className="text-sm text-zinc-500">
            We couldn&apos;t process this drawing. Try again.
          </p>
          <Button onClick={() => router.push('/projects')}>
            Back to projects
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <link
        rel="preload"
        as="fetch"
        href={DEMO_TILE_SOURCE}
        crossOrigin="anonymous"
      />
      <WorkspaceHeader
        projectName={projectMeta.name}
        statsTotal={stats.total}
        statsAccepted={stats.accepted}
        statsRejected={stats.rejected}
      />
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
    </>
  );
}

function WorkspaceHeader({
  projectName,
  statsTotal,
  statsAccepted,
  statsRejected,
}: {
  projectName: string;
  statsTotal: number;
  statsAccepted: number;
  statsRejected: number;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-1 rounded px-2 py-1 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <ChevronLeft className="size-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-1 text-[13px] text-zinc-500">
          <Link href="/projects" className="hover:text-zinc-900">
            Projects
          </Link>
          <ChevronRight className="size-3 text-zinc-300" />
          <span className="font-semibold text-blue-700">{projectName}</span>
        </div>
        <Badge className="bg-amber-100 text-[10px] tracking-wider text-amber-800 uppercase">
          In Review
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 font-mono text-[12px]">
          <span className="text-zinc-700">
            <span className="text-zinc-900">{statsTotal}</span> Detected
          </span>
          <span className="text-emerald-700">
            <span className="font-semibold">{statsAccepted}</span> Accepted
          </span>
          <span className="text-rose-700">
            <span className="font-semibold">{statsRejected}</span> Rejected
          </span>
        </div>
        <div className="h-5 w-px bg-zinc-200" />
        <ExportButton />
      </div>
    </header>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={null}>
      <ProjectInner />
    </Suspense>
  );
}
