import { Suspense } from 'react';
import type { PageComponent } from '@tramvai/react';
import { declareAction } from '@tramvai/core';
import { createBundle } from '@tramvai/core';
import { Await } from '@tramvai/module-common';
import { ChildApp } from '@tramvai/module-child-app';

const deferredHostAction = declareAction({
  name: 'deferredHostAction',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { data: 'payload from deferredHostAction' };
  },
  deferred: true,
  conditions: {
    dynamic: true,
  },
});

const Cmp: PageComponent = () => {
  return (
    <>
      <h2>Root</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await action={deferredHostAction}>{(data) => <span>{JSON.stringify(data)}</span>}</Await>
      </Suspense>

      <div>Host page for the deferred child app</div>
      <h3>Child</h3>
      <ChildApp name="deferred" />
    </>
  );
};

Cmp.childApps = [{ name: 'deferred' }];
Cmp.actions = [deferredHostAction];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'deferred',
  components: {
    pageDefault: Cmp,
  },
});
