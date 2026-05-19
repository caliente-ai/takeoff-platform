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
  editMode: boolean;
  scenario: string | null;
};

type Actions = {
  setJob: (job: Job) => void;
  loadPolygons: (polygons: Polygon[]) => void;
  selectPolygon: (id: string | null) => void;
  updatePolygonStatus: (id: string, status: DetectionStatus) => void;
  deletePolygon: (id: string) => void;
  acceptAllPending: () => number;
  setSidebarFilter: (filter: SidebarFilter) => void;
  reset: () => void;
  getFilteredPolygons: () => Polygon[];
  getStats: () => Stats;
  setEditMode: (on: boolean) => void;
  setScenario: (s: string | null) => void;
  updatePolygonPoints: (id: string, points: [number, number][]) => void;
  movePolygon: (id: string, dx: number, dy: number) => void;
  addPolygon: (polygon: Polygon) => void;
  deleteAllPolygons: () => void;
  updatePolygonLabel: (id: string, label: string) => void;
};

const INITIAL_STATE: State = {
  job: null,
  polygons: [],
  selectedPolygonId: null,
  sidebarFilter: 'all',
  editMode: false,
  scenario: null,
};

const FT_PER_PX = 0.025;

const shoelaceArea = (pts: [number, number][]) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
};

const perimeter = (pts: [number, number][]) => {
  let p = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    p += Math.hypot(x2 - x1, y2 - y1);
  }
  return p;
};

const withDerivedMetrics = (p: Polygon, points: [number, number][]): Polygon => ({
  ...p,
  points,
  area_sqft: Math.round(shoelaceArea(points) * FT_PER_PX * FT_PER_PX),
  perimeter_ft: Math.round(perimeter(points) * FT_PER_PX * 10) / 10,
});

export const useStore = create<State & Actions>((set, get) => ({
  ...INITIAL_STATE,

  setJob: (job) => set({ job }),
  loadPolygons: (polygons) => set({ polygons }),
  selectPolygon: (id) => set({ selectedPolygonId: id }),
  updatePolygonStatus: (id, status) =>
    set((state) => ({
      polygons: state.polygons.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
  deletePolygon: (id) =>
    set((state) => ({
      polygons: state.polygons.filter((p) => p.id !== id),
      selectedPolygonId:
        state.selectedPolygonId === id ? null : state.selectedPolygonId,
    })),
  acceptAllPending: () => {
    const { polygons } = get();
    const count = polygons.filter((p) => p.status === 'pending').length;
    set({
      polygons: polygons.map((p) =>
        p.status === 'pending' ? { ...p, status: 'accepted' } : p,
      ),
    });
    return count;
  },
  setSidebarFilter: (filter) => set({ sidebarFilter: filter }),
  reset: () => set({ ...INITIAL_STATE }),

  setEditMode: (on) => set({ editMode: on }),
  setScenario: (s) => set({ scenario: s }),

  updatePolygonPoints: (id, points) =>
    set((state) => ({
      polygons: state.polygons.map((p) =>
        p.id === id ? withDerivedMetrics(p, points) : p,
      ),
    })),

  movePolygon: (id, dx, dy) =>
    set((state) => ({
      polygons: state.polygons.map((p) =>
        p.id === id
          ? withDerivedMetrics(
              p,
              p.points.map(([x, y]) => [x + dx, y + dy] as [number, number]),
            )
          : p,
      ),
    })),

  addPolygon: (polygon) =>
    set((state) => ({
      polygons: [...state.polygons, polygon],
      selectedPolygonId: polygon.id,
    })),

  deleteAllPolygons: () => set({ polygons: [], selectedPolygonId: null }),

  updatePolygonLabel: (id, label) =>
    set((state) => ({
      polygons: state.polygons.map((p) => (p.id === id ? { ...p, label } : p)),
    })),

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
