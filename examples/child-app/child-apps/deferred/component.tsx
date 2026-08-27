import { Suspense } from 'react';
import { Await } from '@tramvai/module-common';
import { useNavigate, useRoute } from '@tramvai/module-router';
import { deferredChildAction } from './actions';

const DeferredChildWithSuspense = () => {
  const route = useRoute();
  const navigate = useNavigate();

  return (
    <div data-testid="child-with-suspense">
      <div>Route: {route.actualPath}</div>

      <h4>child: dispatch + Await + useStore (с Suspense)</h4>
      <Suspense fallback={<div>Loading...</div>}>
        <Await action={deferredChildAction}>{(data) => <span>{JSON.stringify(data)}</span>}</Await>
      </Suspense>
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(route.actualPath === '/deferred/' ? '/deferred-2/' : '/deferred/')
          }
        >
          Navigate to {route.actualPath === '/deferred/' ? '/deferred-2/' : '/deferred/'}
        </button>
      </div>
    </div>
  );
};

export const DeferredStateCmp = () => (
  <div data-testid="deferred-child">
    <DeferredChildWithSuspense />
  </div>
);
