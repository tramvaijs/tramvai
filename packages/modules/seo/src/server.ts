import { Meta, Render } from '@tinkoff/meta-tags-generate';
import flatten from '@tinkoff/utils/array/flatten';
import isArray from '@tinkoff/utils/is/array';
import { Module } from '@tramvai/core';
import { CONTEXT_TOKEN } from '@tramvai/module-common';
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';

import { converters } from './converters/converters';
import { sharedProviders } from './shared';
import { setServerMetaWalkState } from './store/metaStore';
import { META_WALK_TOKEN, META_UPDATER_TOKEN, META_DEFAULT_TOKEN } from './tokens';
import { transformValue } from './transformValue';
import type { MetaRouteConfig, SeoModuleOptions, PageSeoProperty } from './types';

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

        const renderer = new Render(meta);
        const head = renderer.render({ placement: 'head' });
        const body = renderer.render({ placement: 'body' });

        return [
          {
            slot: ResourceSlot.HEAD_META,
            type: ResourceType.asIs,
            payload: head,
          },
          ...(body !== ''
            ? [
                {
                  slot: ResourceSlot.BODY_TAIL_ANALYTICS,
                  type: ResourceType.asIs,
                  payload: body,
                },
              ]
            : []),
        ];
      },
      multi: true,
      deps: {
        context: CONTEXT_TOKEN,
        metaWalk: META_WALK_TOKEN,
        metaUpdaters: { token: META_UPDATER_TOKEN, optional: true },
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
