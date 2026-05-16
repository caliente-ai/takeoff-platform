export type ProjectStatus = 'in-progress' | 'in-review' | 'complete' | 'archived';

export type Project = {
  id: string;
  name: string;
  subtitle: string;
  status: ProjectStatus;
  sheetsProcessed: number;
  sheetsTotal: number;
  detections: number;
  updatedRelative: string;
};

export const PROJECTS: Project[] = [
  {
    id: 'memorial-hospital',
    name: 'Memorial Hospital',
    subtitle: 'Phase 2 Expansion — MEP Coordination',
    status: 'in-review',
    sheetsProcessed: 142,
    sheetsTotal: 150,
    detections: 3842,
    updatedRelative: '2h ago',
  },
  {
    id: 'westview-office',
    name: 'Westview Office Park',
    subtitle: 'Tower B — Core & Shell Estimating',
    status: 'in-progress',
    sheetsProcessed: 85,
    sheetsTotal: 85,
    detections: 1204,
    updatedRelative: '4h ago',
  },
  {
    id: 'lakeside-elementary',
    name: 'Lakeside Elementary',
    subtitle: 'Renovation & Addition — Final Takeoff',
    status: 'complete',
    sheetsProcessed: 210,
    sheetsTotal: 210,
    detections: 5611,
    updatedRelative: 'yesterday',
  },
  {
    id: 'block-42-retail',
    name: 'Block 42 Retail Center',
    subtitle: 'Lighting & Power — Tenant Fit-out',
    status: 'in-progress',
    sheetsProcessed: 64,
    sheetsTotal: 92,
    detections: 873,
    updatedRelative: '6h ago',
  },
  {
    id: 'riverbend-apartments',
    name: 'Riverbend Apartments',
    subtitle: 'Building C — Plumbing Risers',
    status: 'in-review',
    sheetsProcessed: 118,
    sheetsTotal: 118,
    detections: 2104,
    updatedRelative: '1d ago',
  },
  {
    id: 'greenleaf-medical',
    name: 'Greenleaf Medical Plaza',
    subtitle: 'Suite 200 Fit-out — Mechanical',
    status: 'complete',
    sheetsProcessed: 47,
    sheetsTotal: 47,
    detections: 612,
    updatedRelative: '3d ago',
  },
];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  complete: 'Complete',
  archived: 'Archived',
};

export function getProjectStats(): {
  total: number;
  inProgress: number;
  inReview: number;
  complete: number;
  archived: number;
  totalSheets: number;
  processingQueue: number;
  ytdDetections: number;
} {
  const counts: Record<ProjectStatus, number> = {
    'in-progress': 0,
    'in-review': 0,
    complete: 0,
    archived: 0,
  };
  let totalSheets = 0;
  let ytdDetections = 0;
  let processingQueue = 0;
  for (const p of PROJECTS) {
    counts[p.status]++;
    totalSheets += p.sheetsProcessed;
    ytdDetections += p.detections;
    if (p.status === 'in-progress') {
      processingQueue += p.sheetsTotal - p.sheetsProcessed;
    }
  }
  return {
    total: PROJECTS.length,
    inProgress: counts['in-progress'],
    inReview: counts['in-review'],
    complete: counts.complete,
    archived: counts.archived,
    totalSheets,
    processingQueue,
    ytdDetections,
  };
}
