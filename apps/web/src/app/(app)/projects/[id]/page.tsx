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
import { applyProjectStatuses, loadDemoPolygons } from '@/lib/demo-data';
import { PROJECTS, STATUS_LABEL, type ProjectStatus } from '@/lib/projects';
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

  const id = routeParams?.id;
  const isNewProjectFlow = params.get('demo') === 'mep_hero' && id === 'demo-job-1';
  const projectMeta = PROJECTS.find((p) => p.id === id);
  const fallbackName = projectMeta?.name ?? 'Memorial Hospital — MEP Phase 2';
  const headerStatus: ProjectStatus = projectMeta?.status ?? 'in-review';

  useEffect(() => {
    if (isNewProjectFlow) {
      const state = useStore.getState();
      if (state.job?.status === 'complete') return;
      state.setJob({
        id: id ?? 'demo-job-1',
        filename: `${fallbackName}.pdf`,
        status: 'processing',
        created_at: new Date().toISOString(),
      });
      return;
    }
    if (!projectMeta) return;
    let cancelled = false;
    (async () => {
      const base = await loadDemoPolygons(scenario);
      if (cancelled) return;
      const polygons = applyProjectStatuses(base, projectMeta.status);
      const state = useStore.getState();
      state.reset();
      state.loadPolygons(polygons);
      state.setJob({
        id: projectMeta.id,
        filename: `${projectMeta.name}.pdf`,
        status: 'complete',
        progress: 100,
        polygon_count: polygons.length,
        created_at: new Date().toISOString(),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [isNewProjectFlow, projectMeta, id, fallbackName, scenario]);

  if (isNewProjectFlow) {
    if (!job || job.status === 'processing' || job.status === 'uploading') {
      return <ProcessingScreen scenario={scenario} />;
    }
  } else if (!projectMeta) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <Card className="max-w-md space-y-4 p-8 text-center">
          <h1 className="text-lg font-semibold text-zinc-900">
            Project not found
          </h1>
          <p className="text-sm text-zinc-500">
            We couldn&apos;t find a project with that ID.
          </p>
          <Button onClick={() => router.push('/projects')}>
            Back to projects
          </Button>
        </Card>
      </div>
    );
  } else if (!job || job.id !== projectMeta.id || job.status !== 'complete') {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (job?.status === 'error') {
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
        projectName={fallbackName}
        projectStatus={headerStatus}
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

const STATUS_BADGE_CLASS: Record<ProjectStatus, string> = {
  'in-progress': 'bg-blue-100 text-blue-700',
  'in-review': 'bg-amber-100 text-amber-800',
  complete: 'bg-zinc-100 text-zinc-700',
  archived: 'bg-zinc-100 text-zinc-700',
};

function WorkspaceHeader({
  projectName,
  projectStatus,
  statsTotal,
  statsAccepted,
  statsRejected,
}: {
  projectName: string;
  projectStatus: ProjectStatus;
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
        <Badge
          className={`text-[10px] tracking-wider uppercase ${STATUS_BADGE_CLASS[projectStatus]}`}
        >
          {STATUS_LABEL[projectStatus]}
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
