import { provide } from '@tramvai/core';
import { getDiWrapper } from '@tramvai/test-helpers';
import type { PageResource } from '@tramvai/tokens-render';
import { RENDER_SLOTS } from '@tramvai/tokens-render';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import { CONTEXT_TOKEN } from '@tramvai/module-common';
import { createMockContext } from '@tramvai/test-mocks';
import { META_WALK_TOKEN } from '../../tokens';

import { SeoModule } from '../../server';

export const testRenderSlot = (jsonLd?: Record<string, string>) => {
  const { di } = getDiWrapper({
    modules: [SeoModule],
    providers: [
      {
        provide: PAGE_SERVICE_TOKEN,
        useFactory: () => {
          return {
            getConfig: jest.fn(),
            getComponent: jest.fn(),
            getMeta: () => {
              return {
                seo: {
                  structuredData: {
                    jsonLd,
                  },
                },
              };
            },
          };
        },
      },
      {
        provide: CONTEXT_TOKEN,
        useValue: createMockContext(),
      },
      provide({
        provide: META_WALK_TOKEN,
        useFactory: () => {
          return {
            getSerializableState: jest.fn(),
            updateMeta: jest.fn(),
            eachMeta: jest.fn(),
            reset: jest.fn(),
          };
        },
      }),
    ],
  });

  return (di.get(RENDER_SLOTS) as PageResource[])[1].payload;
};
