import { ChunkExtractorManager } from '@loadable/server';
import { optional, type Container } from '@tinkoff/dippy';
import { CHILD_APP_INTERNAL_CHUNK_EXTRACTOR } from '@tramvai/tokens-child-app';
import type { ComponentType, PropsWithChildren } from 'react';
import { createElement } from 'react';

// Use `.ts` file, not `.tsx` because `@tramvai/build` expect only `.ts` source files extension if file is used in package.json `browser` field
export const Extractor: ComponentType<PropsWithChildren<{ di: Container }>> = ({
  children,
  di,
}) => {
  const extractor = di.get(optional(CHILD_APP_INTERNAL_CHUNK_EXTRACTOR));

  if (!extractor) {
    return children;
  }

  return createElement(ChunkExtractorManager, { extractor }, children);
};
