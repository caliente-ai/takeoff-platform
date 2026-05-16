'use client';

import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { ProjectThumbnail } from '@/components/ProjectThumbnail';
import type { Project, ProjectStatus } from '@/lib/projects';
import { STATUS_LABEL } from '@/lib/projects';

type Props = { project: Project; index: number };

const STATUS_BADGE: Record<ProjectStatus, string> = {
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'in-review': 'bg-amber-100 text-amber-800 border-amber-200',
  complete: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  archived: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

const formatNumber = (n: number): string => n.toLocaleString('en-US');

export function ProjectCard({ project, index }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:border-blue-600"
    >
      <div className="relative border-b border-zinc-200">
        <ProjectThumbnail seed={index + 1} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
        <span
          className={`absolute top-3 left-3 rounded border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${STATUS_BADGE[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[16px] font-semibold text-zinc-900 transition-colors group-hover:text-blue-700">
            {project.name}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
            }}
            aria-label="Project menu"
            className="text-zinc-400 hover:text-zinc-900"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
        <p className="mb-4 line-clamp-1 text-sm text-zinc-500">
          {project.subtitle}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-200 pt-3">
          <div>
            <div className="mb-0.5 text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
              Sheets processed
            </div>
            <div className="flex items-baseline gap-1 font-mono text-[13px] text-zinc-900">
              <span className="text-lg">{formatNumber(project.sheetsProcessed)}</span>
              <span className="text-xs text-zinc-500">
                / {formatNumber(project.sheetsTotal)}
              </span>
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
              Detections
            </div>
            <div
              className={`font-mono text-[13px] ${project.status === 'complete' ? 'text-zinc-500' : 'text-blue-700'}`}
            >
              <span className="text-lg">{formatNumber(project.detections)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
