import { useEffect, useState } from 'react';

export type Layout = 'phone-portrait' | 'phone-landscape' | 'tablet-portrait' | 'wide';

// Decided by the space actually available (works in iPad Split View), not by device type.
function compute(): Layout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w >= 1000 && w >= h) return 'wide';
  if (w >= 700 && h > w) return 'tablet-portrait';
  if (w > h && h < 560) return 'phone-landscape';
  if (w >= 700) return 'wide';
  return 'phone-portrait';
}

export function useLayout(): Layout {
  const [layout, setLayout] = useState(compute);
  useEffect(() => {
    const on = () => setLayout(compute());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return layout;
}

/** Re-render every `ms` (for countdowns and "updated x s ago"). */
export function useTick(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => set((n) => n + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}
