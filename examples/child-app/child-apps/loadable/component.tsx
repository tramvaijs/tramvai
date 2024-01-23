import { lazy, useDi } from '@tramvai/react';
import { useState } from 'react';
import { CHILD_APP_BASE_TOKEN } from './tokens';

const Lazy = lazy(() => import('./lazy-cmp'));

const LazyUnused = lazy(() => import('./lazy-cmp-unused'));

export const LoadableCmp = ({ fromRoot }: { fromRoot: string }) => {
  const [visible, setVisible] = useState(false);
  const val = useDi(CHILD_APP_BASE_TOKEN);

  return (
    <>
      <Lazy />
      <div id="loadable">Child App: {val}</div>
      <button id="loadable-toggle" type="button" onClick={() => setVisible((prev) => !prev)}>
        toggle unused component
      </button>
      {visible && <LazyUnused />}
    </>
  );
};
