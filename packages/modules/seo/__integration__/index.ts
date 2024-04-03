import { createApp, createBundle, declareAction, provide } from '@tramvai/core';
import { SeoModule, META_WALK_TOKEN, META_DEFAULT_TOKEN } from '@tramvai/module-seo';
import { PAGE_SERVICE_TOKEN, ROUTES_TOKEN } from '@tramvai/tokens-router';
import { modules, bundles } from '../../../../test/shared/common';
import { jsonLd } from './data/jsonLd';

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
    await new Promise((res) => setTimeout(res, 200));

    this.deps.meta.updateMeta(20, {
      title: 'WoW, such dynamic!',
    });
  },
  deps: {
    meta: META_WALK_TOKEN,
  },
  conditions: {
    always: true,
  },
});

const dynamicClientAction = declareAction({
  name: 'dynamicMeta',
  async fn() {
    await new Promise((res) => setTimeout(res, 200));

    this.deps.meta.updateMeta(20, {
      title: 'WoW, such dynamic!',
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
