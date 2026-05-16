import { create } from 'zustand';
import type { DetectionStatus, Job, Polygon } from '@/lib/types';

type SidebarFilter = 'all' | DetectionStatus;

type Stats = {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
};

type State = {
  job: Job | null;
  polygons: Polygon[];
  selectedPolygonId: string | null;
  sidebarFilter: SidebarFilter;
};

type Actions = {
  setJob: (job: Job) => void;
  loadPolygons: (polygons: Polygon[]) => void;
  selectPolygon: (id: string | null) => void;
  updatePolygonStatus: (id: string, status: DetectionStatus) => void;
  setSidebarFilter: (filter: SidebarFilter) => void;
  getFilteredPolygons: () => Polygon[];
  getStats: () => Stats;
};

export const useStore = create<State & Actions>((set, get) => ({
  job: null,
  polygons: [],
  selectedPolygonId: null,
  sidebarFilter: 'all',

  setJob: (job) => set({ job }),
  loadPolygons: (polygons) => set({ polygons }),
  selectPolygon: (id) => set({ selectedPolygonId: id }),
  updatePolygonStatus: (id, status) =>
    set((state) => ({
      polygons: state.polygons.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
  setSidebarFilter: (filter) => set({ sidebarFilter: filter }),

  getFilteredPolygons: () => {
    const { polygons, sidebarFilter } = get();
    if (sidebarFilter === 'all') return polygons;
    return polygons.filter((p) => p.status === sidebarFilter);
  },

  getStats: () => {
    const { polygons } = get();
    const stats: Stats = { total: polygons.length, accepted: 0, rejected: 0, pending: 0 };
    for (const p of polygons) stats[p.status]++;
    return stats;
  },
}));
