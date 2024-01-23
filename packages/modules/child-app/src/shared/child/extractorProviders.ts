import { provide } from '@tramvai/core';
import { CHILD_APP_INTERNAL_CHUNK_EXTRACTOR } from '@tramvai/tokens-child-app';
import { ChunkExtractor } from '@loadable/server';
import type { LoadableStats } from '../webpack/moduleFederation';

export const extractorProviders = (loadableStats?: LoadableStats) => [
  provide({
    provide: CHILD_APP_INTERNAL_CHUNK_EXTRACTOR,
    useFactory: () => {
      return new ChunkExtractor({ stats: loadableStats ?? {}, entrypoints: [] });
    },
  }),
];
