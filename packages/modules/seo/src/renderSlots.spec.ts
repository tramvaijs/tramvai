import { MetaWalk } from '@tinkoff/meta-tags-generate';
import { provide } from '@tramvai/core';
import { CONTEXT_TOKEN } from '@tramvai/module-common';
import { getDiWrapper } from '@tramvai/test-helpers';
import { createMockContext } from '@tramvai/test-mocks';
import { PageResource, RENDER_SLOTS } from '@tramvai/tokens-render';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';

import { SeoModule } from './server';
import { META_WALK_TOKEN } from './tokens';

const renderSlots = (jsonLd?: Record<string, string>) => {
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
        useClass: MetaWalk,
      }),
    ],
  });

  return (di.get(RENDER_SLOTS) as PageResource[][])[0][1]?.payload;
};

describe('renderSlots', () => {
  const APPLICATION_JSON = 'application/ld+json';
  const expectJsonLd = {
    some: 'text',
  };
  it('should jsonLd when pageService jsonLd is not empty', async () => {
    const jsonLd = renderSlots(expectJsonLd);

    expect(jsonLd).toMatch(JSON.stringify(expectJsonLd));
    expect(jsonLd).toMatch(JSON.stringify(APPLICATION_JSON));
  });

  it('should no jsonLd when pageService jsonLd is empty object {}', async () => {
    const jsonLd = renderSlots({});

    expect(jsonLd).toEqual(expect.not.stringContaining(APPLICATION_JSON));
  });

  it('should no jsonLd when pageService jsonLd is empty', async () => {
    const jsonLd = renderSlots();

    expect(jsonLd).toEqual(expect.not.stringContaining(APPLICATION_JSON));
  });
});
