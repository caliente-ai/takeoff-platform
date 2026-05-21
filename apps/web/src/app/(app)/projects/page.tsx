'use client';

import { useMemo, useState } from 'react';
import { Download, Filter, Grid2x2, List, Plus } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { NewProjectDialog } from '@/components/NewProjectDialog';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import {
  getProjectStats,
  PROJECTS,
  type ProjectStatus,
} from '@/lib/projects';

type Tab = 'all' | ProjectStatus;
const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'complete', label: 'Complete' },
];

const formatNumber = (n: number): string => n.toLocaleString('en-US');

export default function ProjectsDashboard() {
  const [tab, setTab] = useState<Tab>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = useMemo(getProjectStats, []);
  const filtered = useMemo(
    () => (tab === 'all' ? PROJECTS : PROJECTS.filter((p) => p.status === tab)),
    [tab],
  );

  const tabCount = (t: Tab): number => {
    if (t === 'all') return stats.total;
    if (t === 'in-progress') return stats.inProgress;
    if (t === 'in-review') return stats.inReview;
    if (t === 'complete') return stats.complete;
    return 0;
  };

  return (
    <>
      <AppHeader
        title="Projects"
        count={stats.total}
        searchPlaceholder="Search projects..."
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5" />
              Create new
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-end justify-between border-b border-hairline">
          <div className="flex h-10 gap-6">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className={`flex items-center border-b-2 px-1 text-[13px] font-medium transition-colors ${
                    active
                      ? 'border-ember text-bone'
                      : 'border-transparent text-slate hover:border-hairline-bright hover:text-bone'
                  }`}
                >
                  {t.label}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      active
                        ? 'bg-ember/15 text-ember'
                        : 'bg-carbon-high text-slate-dim'
                    }`}
                  >
                    {tabCount(t.value)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Button variant="outline" size="xs">
              <Filter className="size-3.5" />
              Filter
            </Button>
            <div className="flex overflow-hidden rounded-lg border border-hairline bg-carbon">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView('grid')}
                className={`grid h-7 w-8 place-items-center border-r border-hairline transition-colors ${
                  view === 'grid'
                    ? 'bg-carbon-high text-ember'
                    : 'text-slate hover:bg-carbon-high hover:text-bone'
                }`}
              >
                <Grid2x2 className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView('list')}
                className={`grid h-7 w-8 place-items-center transition-colors ${
                  view === 'list'
                    ? 'bg-carbon-high text-ember'
                    : 'text-slate hover:bg-carbon-high hover:text-bone'
                }`}
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-slate">
            No projects in this tab.
          </p>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-hairline bg-carbon">
            <table className="w-full divide-y divide-hairline text-sm">
              <thead className="bg-carbon-high text-[10px] tracking-wider text-slate-dim uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Name</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Sheets</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Detections
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-carbon-high"
                  >
                    <td className="px-4 py-2.5 font-medium text-bone">
                      {p.name}
                    </td>
                    <td className="px-4 py-2.5 text-slate">{p.status}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[13px] text-slate">
                      {p.sheetsProcessed}/{p.sheetsTotal}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[13px] text-blueprint">
                      {p.detections.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-slate-dim">
                      {p.updatedRelative}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Active Sheets"
            value={formatNumber(stats.totalSheets)}
          />
          <StatCard
            label="Processing Queue"
            value={String(stats.processingQueue)}
            tone="warning"
          />
          <StatCard
            label="Total Detections YTD"
            value={formatNumber(stats.ytdDetections)}
          />
          <StatCard label="System Status" value="All systems operational" status />
        </div>
      </div>

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
  status,
}: {
  label: string;
  value: string;
  tone?: 'warning';
  status?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-carbon p-4 transition-colors hover:border-hairline-bright">
      <div className="eyebrow">{label}</div>
      {status ? (
        <div className="mt-2.5 flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-status-accepted" />
          <span className="font-mono text-[13px] text-bone">{value}</span>
        </div>
      ) : (
        <div
          className={`mt-1.5 font-mono text-xl ${tone === 'warning' ? 'text-ember' : 'text-bone'}`}
        >
          {value}
        </div>
      )}
    </div>
  );
}
