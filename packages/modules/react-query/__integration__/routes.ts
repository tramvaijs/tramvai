import type { ROUTES_TOKEN } from '@tramvai/module-router';

export const routes: Array<typeof ROUTES_TOKEN> = [
  {
    name: 'use-query-base',
    path: '/use-query-base',
    config: {
      pageComponent: 'use-query-base',
    },
  },
  {
    name: 'use-query-prefetch',
    path: '/use-query-prefetch',
    config: {
      pageComponent: 'use-query-prefetch',
    },
  },
  {
    name: 'use-query-multiple-prefetch',
    path: '/use-query-multiple-prefetch',
    config: {
      pageComponent: 'use-query-multiple-prefetch',
    },
  },
  {
    name: 'use-query-fetch',
    path: '/use-query-fetch',
    config: {
      pageComponent: 'use-query-fetch',
    },
  },
  {
    name: 'use-same-query-many-components',
    path: '/use-same-query-many-components',
    config: {
      pageComponent: 'use-same-query-many-components',
    },
  },
  {
    name: 'use-query-parameters',
    path: '/use-query-parameters',
    config: {
      pageComponent: 'use-query-parameters',
    },
  },
  {
    name: 'use-query-options',
    path: '/use-query-options',
    config: {
      pageComponent: 'use-query-options',
    },
  },
  {
    name: 'use-query-fail',
    path: '/use-query-fail',
    config: {
      pageComponent: 'use-query-fail',
    },
  },
  {
    name: 'use-infinite-query',
    path: '/use-infinite-query',
    config: {
      pageComponent: 'use-infinite-query',
    },
  },
  {
    name: 'use-infinite-query-multiple-prefetch',
    path: '/use-infinite-query-multiple-prefetch',
    config: {
      pageComponent: 'use-infinite-query-multiple-prefetch',
    },
  },
  {
    name: 'use-mutation',
    path: '/use-mutation',
    config: {
      pageComponent: 'use-mutation',
    },
  },
  {
    name: 'use-query-conditions',
    path: '/use-query-conditions',
    config: {
      pageComponent: 'use-query-conditions',
    },
  },
  {
    name: 'use-queries',
    path: '/use-queries',
    config: {
      pageComponent: 'use-queries',
    },
  },
];
