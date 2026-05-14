import { Scope, provide } from '@tramvai/core';
import {
  CHILD_APP_INTERNAL_CHUNK_EXTRACTOR,
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
  CHILD_APP_LOADER_TOKEN,
} from '@tramvai/tokens-child-app';
import { ChunkExtractor } from '@loadable/server';
import { Container } from '@tinkoff/dippy';
import type { LoadableStats } from '../webpack/moduleFederation';

export const extractorProviders = (appDi: Container) => [
  provide({
    provide: CHILD_APP_INTERNAL_CHUNK_EXTRACTOR,
    scope: Scope.REQUEST,
    useFactory: ({ config }) => {
      const loader = appDi.get(CHILD_APP_LOADER_TOKEN);
      const statsLoadable: LoadableStats | undefined =
        'getLoadableStats' in loader ? (loader as any).getLoadableStats(config) : undefined;

      return new ChunkExtractor({ stats: statsLoadable ?? {}, entrypoints: [] });
    },
    deps: {
      config: CHILD_APP_INTERNAL_CONFIG_TOKEN,
    },
  }),
];
