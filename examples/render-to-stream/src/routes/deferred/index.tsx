import { declareAction } from '@tramvai/core';
import { Await } from '@tramvai/module-common';
import type { PageComponent } from '@tramvai/react';
import { lazy } from '@tramvai/react';
import { Suspense } from 'react';

const LazyTitle = lazy(() => import('../../components/features/Title/Title'));
const LazyData = lazy(() => import('../../components/features/Data/Data'));

const longDeferredAction = declareAction({
  name: 'longDeferred',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: 'ok' };
  },
  deferred: true,
});
const fastDeferredAction = declareAction({
  name: 'fastDeferred',
  async fn() {
    return { data: 'ok' };
  },
  deferred: true,
});
const failedFastDeferredAction = declareAction({
  name: 'failedFastDeferred',
  async fn() {
    throw new Error('Failed Fast Deferred');
  },
  deferred: true,
});
const failedDeferredAction = declareAction({
  name: 'failedDeferred',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new Error('Failed Deferred');
  },
  deferred: true,
});

export const DeferredPage: PageComponent = () => {
  return (
    <>
      <LazyTitle>Deferred Page</LazyTitle>
      <Suspense fallback={<div>Loading long...</div>}>
        <Await action={longDeferredAction}>
          {(data) => {
            return <LazyData data={`Response: ${data.data}`} />;
          }}
        </Await>
      </Suspense>
      <Suspense fallback={<div>Loading fast...</div>}>
        <Await action={fastDeferredAction}>
          {(data) => {
            return <div>Response: {data.data}</div>;
          }}
        </Await>
      </Suspense>
      <Suspense fallback={<div>Loading fast error...</div>}>
        <Await
          action={failedFastDeferredAction}
          error={(reason) => {
            return <div>Error: {reason.message}</div>;
          }}
        >
          {(data) => {
            return <></>;
          }}
        </Await>
      </Suspense>
      <Suspense fallback={<div>Loading long error...</div>}>
        <Await
          action={failedDeferredAction}
          error={(reason) => {
            return <div>Error: {reason.message}</div>;
          }}
        >
          {(data) => {
            return <></>;
          }}
        </Await>
      </Suspense>
    </>
  );
};

DeferredPage.actions = [
  longDeferredAction,
  fastDeferredAction,
  failedFastDeferredAction,
  failedDeferredAction,
];

export default DeferredPage;
