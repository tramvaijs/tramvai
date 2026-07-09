import type { PageComponent } from '@tramvai/react';
import { Suspense } from 'react';

const ThrowingComponent = () => {
  if (typeof window === 'undefined') {
    throw new Error('SSR recoverable error');
  }
  return <span id="ssr-recoverable-client">Client rendered</span>;
};

export const SsrRecoverableErrorPage: PageComponent = () => {
  return (
    <div>
      <span id="ssr-recoverable-ok">Page shell rendered</span>
      <Suspense fallback={<span id="ssr-recoverable-fallback">Fallback</span>}>
        <ThrowingComponent />
      </Suspense>
    </div>
  );
};
