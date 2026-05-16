'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function DemoHotkeys() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const isReset =
        (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'd' || e.key === 'D');
      if (!isReset) return;
      e.preventDefault();
      router.push('/projects/demo-job-1?demo=mep_hero');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);
  return null;
}
