import type { JsPreloadResource } from './types';

export function onload(next: JsPreloadResource[]) {
  let called = false;

  return () => {
    if (!called) {
      called = true;

      const { head } = document;

      next.forEach((entry) => {
        const link = document.createElement('link');
        if (entry.integrity) {
          link.integrity = entry.integrity;
        }
        link.rel = 'preload';
        link.href = entry.url;
        link.as = 'script';
        link.charset = 'utf-8';
        link.crossOrigin = 'anonymous';

        head.appendChild(link);
      });
    }
  };
}
