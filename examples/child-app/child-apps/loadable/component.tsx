import type { PropsWithChildren } from 'react';
import { useDi } from '@tramvai/react';
import { Link } from '@tramvai/module-router';
import { useStore } from '@tramvai/state';
import { CHILD_APP_BASE_TOKEN } from './tokens';
import { testStore } from './stores';

export const LoadableCmp = ({ fromRoot, children }: PropsWithChildren<{ fromRoot: string }>) => {
  const val = useDi(CHILD_APP_BASE_TOKEN);
  const actionsList = useStore(testStore);

  return (
    <>
      <ul>
        <li>
          <Link url="/loadable/">/loadable/</Link>
        </li>
        <li>
          <Link url="/loadable/foo/">/loadable/foo/</Link>
        </li>
        <li>
          <Link url="/loadable/bar/" prefetch={false}>
            /loadable/bar/
          </Link>
        </li>
      </ul>

      <div id="loadable">Child App: {val}</div>

      {children}

      <p>Actions list</p>

      <ul id="loadable-actions-list">
        {actionsList.map((action, i) => {
          return <li key={i}>{action}</li>;
        })}
      </ul>
    </>
  );
};
