import type { RefObject } from 'react';

export const createUseObserverVisible =
  (observerOptions: IntersectionObserverInit) => (containerRef: RefObject<HTMLElement | null>) => {
    return true;
  };
