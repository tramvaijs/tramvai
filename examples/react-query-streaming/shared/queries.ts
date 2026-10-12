import { createInfiniteQuery, createQuery } from '@tramvai/react-query';
import type { DemoRequestParams, DemoResponse } from './api';
import { fakeRequest } from './api';

export type DemoQuery = ReturnType<typeof createQuery<void, DemoResponse, any>>;

/**
 * Query with a serializable key, every scenario creates its own with unique `name`
 */
export const createDemoQuery = (
  params: DemoRequestParams,
  { retry, deferred = false }: { retry?: number; deferred?: boolean } = {}
): DemoQuery =>
  createQuery({
    key: ['demo', params.name, params.delay, params.failStatus ?? 0],
    fn: () => fakeRequest(params),
    queryOptions: retry === undefined ? undefined : { retry },
    deferred,
  });

export const INFINITE_PAGES_LIMIT = 3;

export type DemoInfiniteQuery = ReturnType<typeof createDemoInfiniteQuery>;

/**
 * Infinite query, every page is a separate request with the same delay
 */
export const createDemoInfiniteQuery = (
  { name, delay }: DemoRequestParams,
  { deferred = false }: { deferred?: boolean } = {}
) =>
  createInfiniteQuery<void, DemoResponse, {}, number>({
    key: ['demo-infinite', name, delay],
    fn: (_, pageParam) => fakeRequest({ name: `${name} page ${pageParam}`, delay }),
    initialPageParam: 0,
    getNextPageParam: (_, allPages) =>
      allPages.length < INFINITE_PAGES_LIMIT ? allPages.length : undefined,
    deferred,
  });
