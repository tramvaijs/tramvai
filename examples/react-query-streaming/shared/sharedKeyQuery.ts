import { createQuery } from '@tramvai/react-query';
import { fakeRequest } from './api';
import type { DemoQuery } from './queries';

/**
 * Host and child-app queries with the same key but different data,
 * to check that streamed data never ends up in the wrong QueryClient
 */
export const sharedKeyQuery = (owner: 'host' | 'child'): DemoQuery =>
  createQuery({
    key: ['shared-key'],
    actionNamePostfix: `shared-key-${owner}`,
    fn: () => fakeRequest({ name: `shared-key (${owner})`, delay: owner === 'host' ? 1000 : 2000 }),
    deferred: true,
  });
