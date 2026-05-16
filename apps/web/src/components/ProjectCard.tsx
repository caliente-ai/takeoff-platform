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
  'in-progress': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'in-review': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  complete: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  archived: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

const formatNumber = (n: number): string => n.toLocaleString('en-US');

export function ProjectCard({ project, index }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <div className="size-full transition-transform duration-700 group-hover:scale-105">
          <ProjectThumbnail seed={index + 1} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
        <span
          className={`absolute top-3 right-3 rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${STATUS_BADGE[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[18px] font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">
            {project.name}
          </h3>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Project menu"
            className="text-slate-400 hover:text-slate-700"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
        <p className="mb-4 flex items-center gap-1 text-[12px] text-slate-500">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">{project.subtitle}</span>
        </p>

        <div className="mt-auto">
          <div className="mb-4 flex flex-wrap gap-2">
            <Pill
              icon={<FileText className="size-3.5 text-blue-700" />}
              value={`${project.sheetsProcessed} Sheets`}
            />
            <Pill
              icon={<Square className="size-3.5 text-indigo-600" />}
              value={`${formatNumber(project.detections)} Items`}
            />
            <Pill
              icon={
                project.status === 'complete' ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                ) : (
                  <History className="size-3.5 text-rose-500" />
                )
              }
              value="Rev v1"
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-[12px] text-slate-500">
              Edited {project.updatedRelative}
            </span>
            <span className="grid size-6 place-items-center rounded-full border-2 border-white bg-blue-100 text-[10px] font-bold text-blue-700">
              DB
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Pill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
      {icon}
      <span className="font-mono text-[12px] font-medium text-slate-700">
        {value}
      </span>
    </span>
  );
}
