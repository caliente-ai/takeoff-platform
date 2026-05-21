'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  History,
  MapPin,
  MoreVertical,
  Square,
} from 'lucide-react';
import { ProjectThumbnail } from '@/components/ProjectThumbnail';
import type { Project, ProjectStatus } from '@/lib/projects';
import { STATUS_LABEL } from '@/lib/projects';

type Props = { project: Project; index: number };

const STATUS_BADGE: Record<ProjectStatus, string> = {
  'in-progress': 'bg-blueprint/15 text-blueprint-bright border-blueprint/25',
  'in-review': 'bg-ember/15 text-ember border-ember/25',
  complete:
    'bg-status-accepted/15 text-status-accepted border-status-accepted/30',
  archived: 'bg-carbon-high text-slate border-hairline',
};

const formatNumber = (n: number): string => n.toLocaleString('en-US');

export function ProjectCard({ project, index }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-hairline bg-carbon transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-hairline-bright"
    >
      <div className="relative h-48 overflow-hidden bg-ink">
        <div className="size-full transition-transform duration-700 group-hover:scale-105">
          <ProjectThumbnail seed={index + 1} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <span
          className={`absolute top-3 right-3 rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${STATUS_BADGE[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-display text-[18px] font-semibold tracking-tight text-bone">
            {project.name}
          </h3>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Project menu"
            className="text-slate-dim transition-colors hover:text-bone"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
        <p className="mb-4 flex items-center gap-1 text-[12px] text-slate">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">{project.subtitle}</span>
        </p>

        <div className="mt-auto">
          <div className="mb-4 flex flex-wrap gap-2">
            <Pill
              icon={<FileText className="size-3.5 text-blueprint" />}
              value={`${project.sheetsProcessed} Sheets`}
            />
            <Pill
              icon={<Square className="size-3.5 text-slate" />}
              value={`${formatNumber(project.detections)} Items`}
            />
            <Pill
              icon={
                project.status === 'complete' ? (
                  <CheckCircle2 className="size-3.5 text-status-accepted" />
                ) : (
                  <History className="size-3.5 text-ember" />
                )
              }
              value="Rev v1"
            />
          </div>
          <div className="flex items-center justify-between border-t border-hairline pt-4">
            <span className="text-[12px] text-slate-dim">
              Edited {project.updatedRelative}
            </span>
            <span className="grid size-6 place-items-center rounded-full border-2 border-carbon bg-blueprint/15 text-[10px] font-bold text-blueprint-bright">
              DB
            </span>
          </div>
        </div>
      </div>

      {/* Signature Ember card pattern — ember underline draws in on hover */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-ember transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
    </Link>
  );
}

function Pill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-hairline bg-carbon-high px-2 py-1">
      {icon}
      <span className="font-mono text-[12px] font-medium text-slate">
        {value}
      </span>
    </span>
  );
}
