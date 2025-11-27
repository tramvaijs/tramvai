import { createApp, createBundle, declareAction, provide } from '@tramvai/core';
import { SeoModule, META_WALK_TOKEN, META_DEFAULT_TOKEN } from '@tramvai/module-seo';
import { PAGE_SERVICE_TOKEN, ROUTES_TOKEN } from '@tramvai/tokens-router';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import React from 'react';
import { jsonLd } from './data/jsonLd';
import { Button } from './Button';
import { APPLY_META_TOKEN } from '../src/tokens';
import { ApplyMetaRobotsButton } from './ApplyMetaRobotsButton';

const metaSpecial = (context, meta) => {
  meta.updateMeta(10, {
    metaCustom: {
      tag: 'meta',
      attributes: {
        name: 'metaCustomNameAttribute',
        content: 'metaCustomContent',
      },
    },
  });
};

const dynamicAction = declareAction({
  name: 'dynamicMeta',
  async fn() {
    this.deps.meta.updateMeta(20, {
      title: 'WoW, such dynamic!',
      robots: 'skip',
    });
  },
  deps: {
    meta: META_WALK_TOKEN,
  },
  conditions: {
    always: true,
  },
});

export const applyMetaRobotsAction = declareAction({
  name: 'applyMetaRobots',
  async fn() {
    this.deps.applyMeta({
      metaObj: {
        robots: 'skip',
      },
    });
  },
  deps: {
    applyMeta: APPLY_META_TOKEN,
  },
});

export const applyMetaAction = declareAction({
  name: 'applyMeta',
  async fn() {
    this.deps.applyMeta({
      metaObj: {
        title: 'WoW, meta was applied!',
        twitterCard: 'twitter card',
      },
    });
  },
  deps: {
    applyMeta: APPLY_META_TOKEN,
  },
  conditions: {
    always: true,
  },
});

const dynamicClientAction = declareAction({
  name: 'dynamicMeta',
  async fn() {
    await new Promise((res) => setTimeout(res, 1000));

    this.deps.meta.updateMeta(20, {
      title: 'WoW, such dynamic!',
      robots: 'skip',
    });
  },
  deps: {
    meta: META_WALK_TOKEN,
  },
  conditions: {
    always: true,
    onlyBrowser: true,
  },
});

const dynamicServerAction = declareAction({
  name: 'dynamicMetaSucceedOnServer',
  async fn() {
    this.deps.meta.updateMeta(10, {
      title: 'Hello, this is Tramvai!',
      robots: 'all',
    });
  },
  deps: {
    meta: META_WALK_TOKEN,
  },
});

const dynamicBundle = createBundle({
  name: 'dynamic',
  components: {
    page: () => 'dynamic page',
    layout: ({ children }) => children,
  },
  actions: [dynamicAction],
});

const dynamicClientBundle = createBundle({
  name: 'dynamic-client',
  components: {
    page: () => 'dynamic client page',
    layout: ({ children }) => children,
  },
  actions: [dynamicClientAction],
});

const dynamicServerBundle = createBundle({
  name: 'dynamic-server',
  components: {
    page: () => 'dynamic server page',
    layout: ({ children }) => children,
  },
  actions: [dynamicServerAction],
});

const dynamicServerAndClientBundle = createBundle({
  name: 'dynamic-server-and-dynamic-client',
  components: {
    page: () => 'dynamic server page',
    layout: ({ children }) => children,
  },
  actions: [dynamicServerAction, dynamicClientAction],
});

const applyMetaBundle = createBundle({
  name: 'apply-meta',
  components: {
    page: () => (
      <div>
        <Button />
        <ApplyMetaRobotsButton />
      </div>
    ),
    layout: ({ children }) => children,
  },
});

createApp({
  name: 'seo',
  modules: [...modules, SeoModule.forRoot([metaSpecial] as any)],
  bundles: {
    ...bundles,
    dynamic: () => Promise.resolve({ default: dynamicBundle }),
    'dynamic-client': () => Promise.resolve({ default: dynamicClientBundle }),
    'dynamic-server': () => Promise.resolve({ default: dynamicServerBundle }),
    'dynamic-server-and-dynamic-client': () =>
      Promise.resolve({ default: dynamicServerAndClientBundle }),
    'apply-meta': () => Promise.resolve({ default: applyMetaBundle }),
  },
  providers: [
    {
      provide: ROUTES_TOKEN,
      multi: true,

      useValue: [
        {
          name: 'default',
          path: '/seo/default/',
        },
        {
          name: 'robots-skip',
          path: '/robots/skip/',
          config: {
            meta: {
              seo: {
                metaTags: {
                  robots: 'skip',
                },
              },
            },
          },
        },
        {
          name: 'robots-all',
          path: '/robots/all/',
          config: {
            meta: {
              seo: {
                metaTags: {
                  robots: 'all',
                },
              },
            },
          },
        },
        {
          name: 'common',
          path: '/seo/common/',
          config: {
            meta: {
              seo: {
                metaTags: {
                  canonical: 'test-canonical',
                  descriptions: 'my test description',
                  keywords: 'test,common,seo',
                  robots: 'none',
                  title: 'common seo',
                  viewport: 'test seo',
                },
              },
            },
          },
        },
        {
          name: 'twitter',
          path: '/seo/twitter/',
          config: {
            meta: {
              seo: {
                metaTags: {
                  title: 'twitter seo',
                },
                shareSchema: {
                  twitterCard: {
                    card: 'twitter card',
                    creator: 'creat',
                    image: 'img tw',
                    imageAlt: 'seo tw im al',
                    site: 'seo @tinkoff_bank',
                    title: 'hello, twitter',
                  },
                },
              },
            },
          },
        },
        {
          name: 'og',
          path: '/seo/og/',
          config: {
            meta: {
              seo: {
                metaTags: {
                  title: 'og seo',
                },
                shareSchema: {
                  openGraph: {
                    description: 'og desc',
                    image: 'og img',
                    imageAlt: 'alt og img',
                    imageSecure: 'seo imageSecure',
                    imageHeight: 'seo 630',
                    imageWidth: 'seo 1200',
                    imageType: 'ggog',
                    locale: 'locog',
                    siteName: 'site og name',
                    title: 'hello, og',
                    type: 'og typ',
                    url: 'http://og.og/',
                  },
                },
              },
            },
          },
        },
        {
          name: 'json-ld',
          path: '/seo/json-ld/',
          config: {
            meta: {
              seo: {
                metaTags: {
                  title: 'json-ld seo',
                },
                structuredData: {
                  jsonLd,
                },
              },
            },
          },
        },
        {
          name: 'seo-dynamic',
          path: '/seo/dynamic/',
          config: {
            bundle: 'dynamic',
            pageComponent: 'page',
            layoutComponent: 'layout',
          },
        },
        {
          name: 'seo-dynamic-client',
          path: '/seo/dynamic-client/',
          config: {
            bundle: 'dynamic-client',
            pageComponent: 'page',
            layoutComponent: 'layout',
          },
        },
        {
          name: 'seo-dynamic-server',
          path: '/seo/dynamic-server',
          config: {
            bundle: 'dynamic-server',
            pageComponent: 'page',
            layoutComponent: 'layout',
          },
        },
        {
          name: 'seo-dynamic-server-and-dynamic-client',
          path: '/seo/dynamic-server-dynamic-client',
          config: {
            bundle: 'dynamic-server-and-dynamic-client',
            pageComponent: 'page',
            layoutComponent: 'layout',
          },
        },
        {
          name: 'seo-apply-meta',
          path: '/seo/apply-meta',
          config: {
            bundle: 'apply-meta',
            pageComponent: 'page',
            layoutComponent: 'layout',
            meta: {
              seo: {
                metaTags: {
                  canonical: 'test-canonical',
                  descriptions: 'my test description',
                  keywords: 'test,common,seo',
                  robots: 'none',
                  title: 'common seo',
                  viewport: 'test viewport seo',
                },
              },
            },
          },
        },
      ].map((route) => ({
        ...route,
        config: {
          bundle: 'root',
          pageComponent: 'page',
          layoutComponent: 'layout',
          ...route.config,
        },
      })),
    },
    provide({
      provide: META_DEFAULT_TOKEN,
      useFactory: ({ pageService }) => {
        const { origin, pathname } = pageService.getCurrentUrl();

        return {
          metaFromPageService: {
            tag: 'meta',
            attributes: {
              name: 'attrFromPageService',
              content: `${origin}${pathname}`,
            },
          },
        };
      },
      deps: {
        pageService: PAGE_SERVICE_TOKEN,
      },
    }),
  ],
});
