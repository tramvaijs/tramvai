import { createDemoQuery } from '../shared/queries';
import { sharedKeyQuery } from '../shared/sharedKeyQuery';

export const childBlockingQuery = createDemoQuery({ name: 'child-blocking', delay: 200 });
export const childDeferredQuery = createDemoQuery({ name: 'child-deferred-use-query', delay: 1500 }, { deferred: true });
export const childSuspenseQuery = createDemoQuery({ name: 'child-deferred-suspense', delay: 2500 }, { deferred: true });
export const childSharedKeyQuery = sharedKeyQuery('child');
