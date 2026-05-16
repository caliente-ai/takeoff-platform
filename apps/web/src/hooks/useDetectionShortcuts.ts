'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';

const isFormElement = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

export function useDetectionShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (isFormElement(e.target)) return;
      const state = useStore.getState();
      const id = state.selectedPolygonId;
      if (!id) return;
      const polygon = state.polygons.find((p) => p.id === id);
      if (!polygon) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        state.updatePolygonStatus(id, 'accepted');
        toast.success(`Accepted: ${polygon.label}`);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        state.updatePolygonStatus(id, 'rejected');
        toast.success(`Rejected: ${polygon.label}`);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        state.deletePolygon(id);
        toast.success(`Deleted: ${polygon.label}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
