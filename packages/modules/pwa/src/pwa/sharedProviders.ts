import { PrefixTree, Scope, provide } from '@tramvai/core';
import { SimplifiedPWAConfig } from '@tramvai/plugin-base-builder/lib/types';

import { createSelectActivePwaConfig } from './utils/selectActivePwaConfig';
import { PWA_PREFIX_TREE, PWA_RESOLVE_TOKEN } from '../tokens';

export const sharedProviders = [
  provide({
    provide: PWA_PREFIX_TREE,
    scope: Scope.SINGLETON,
    useValue: new PrefixTree<SimplifiedPWAConfig>({
      delimiter: '/',
    }),
  }),
  provide({
    provide: PWA_RESOLVE_TOKEN,
    useFactory: ({ prefixTree }) => {
      return createSelectActivePwaConfig(prefixTree);
    },
    deps: {
      prefixTree: PWA_PREFIX_TREE,
    },
  }),
];
