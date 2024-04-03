import { Module } from '@tramvai/core';
import { CONTEXT_TOKEN } from '@tramvai/module-common';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';
import flatten from '@tinkoff/utils/array/flatten';
import path from '@tinkoff/utils/object/path';
import { Meta, Render } from '@tinkoff/meta-tags-generate';
import isArray from '@tinkoff/utils/is/array';
import isEmpty from '@tinkoff/utils/is/empty';
import { META_WALK_TOKEN, META_UPDATER_TOKEN, META_DEFAULT_TOKEN } from './tokens';
import { transformValue } from './transformValue';
import { sharedProviders } from './shared';
import { converters } from './converters/converters';
import type { MetaRouteConfig, SeoModuleOptions, PageSeoProperty } from './types';
import { setServerMetaWalkState } from './store/metaStore';

export * from './constants';
export * from './tokens';

declare module '@tramvai/react' {
  export interface PageComponentOptions {
    seo?: PageSeoProperty;
  }
}

declare module '@tinkoff/router' {
  export interface RouteConfig {
    meta?: MetaRouteConfig;
  }
}

@Module({
  providers: [
    ...sharedProviders,
    {
      provide: RENDER_SLOTS,
      useFactory: ({ metaWalk, metaUpdaters, context }) => {
        const meta = new Meta({
          list: flatten(metaUpdaters || []),
          transformValue,
          converters,
          metaWalk,
        });

        // We should do this before rendering because rendering resets the state of MetaWalk
        context.dispatch(setServerMetaWalkState(metaWalk.getSerializableState()));

        const result = new Render(meta).render();

        return {
          slot: ResourceSlot.HEAD_META,
          type: ResourceType.asIs,
          payload: result,
        };
      },
      multi: true,
      deps: {
        metaWalk: META_WALK_TOKEN,
        metaUpdaters: { token: META_UPDATER_TOKEN, optional: true },
        context: CONTEXT_TOKEN,
      },
    },
    {
      // вставка ld json
      provide: RENDER_SLOTS,
      multi: true,
      useFactory: ({ pageService }) => {
        const jsonLd = path(['seo', 'structuredData', 'jsonLd'], pageService.getMeta());

        if (isEmpty(jsonLd)) {
          return {};
        }

        return {
          slot: ResourceSlot.BODY_TAIL_ANALYTICS,
          type: ResourceType.asIs,
          payload: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
        };
      },
      deps: {
        pageService: PAGE_SERVICE_TOKEN,
      },
    },
  ],
})
export class SeoModule {
  static forRoot(options: SeoModuleOptions) {
    // легаси ветка для старого формата
    // TODO: убрать
    if (isArray(options)) {
      return {
        mainModule: SeoModule,
        providers: [
          {
            provide: 'metaList',
            useValue: options,
            multi: true,
          },
        ],
      };
    }

    const { metaUpdaters, metaDefault } = options;
    const providers = [];

    if (metaDefault) {
      providers.push({
        provide: META_DEFAULT_TOKEN,
        useValue: metaDefault,
      });
    }

    if (metaUpdaters) {
      providers.push({
        provide: META_UPDATER_TOKEN,
        useValue: metaUpdaters,
        multi: true,
      });
    }

    return {
      providers,
      mainModule: SeoModule,
    };
  }
}
