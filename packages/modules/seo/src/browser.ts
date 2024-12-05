import isArray from '@tinkoff/utils/is/array';
import { Module, Scope, provide } from '@tramvai/core';
import { COMMAND_LINE_EXECUTION_END_TOKEN } from '@tramvai/tokens-core-private';
import { INITIAL_APP_STATE_TOKEN } from '@tramvai/module-common';
import { sharedProviders } from './shared';
import {
  META_UPDATER_TOKEN,
  META_DEFAULT_TOKEN,
  META_WALK_TOKEN,
  APPLY_META_TOKEN,
} from './tokens';
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
    provide({
      provide: 'router beforeNavigateHooks',
      multi: true,
      useFactory: ({ metaWalk }) => {
        return () => {
          // clear meta state before SPA-navigation
          metaWalk.reset();
        };
      },
      deps: {
        metaWalk: META_WALK_TOKEN,
      },
    }),
    provide({
      // Update meta only when all actions were completed.
      provide: COMMAND_LINE_EXECUTION_END_TOKEN,
      scope: Scope.SINGLETON,
      multi: true,
      useFactory: ({ applyMeta }) => {
        return function updateMeta(di, type, status) {
          if (type === 'client' && (status === 'afterSpa' || status === 'customer')) {
            const metaWalk = di.get(META_WALK_TOKEN);

            // Be careful: because it executes on customer start
            // it can override some metadata that was received(executed) on the client before.
            // We can easily control it by priority value and give the server meta-updates lower priority in these scenarios.
            if (status === 'customer') {
              const initialState = di.get({ token: INITIAL_APP_STATE_TOKEN, optional: true });
              metaWalk.mergeValuesFromSerializableState(
                initialState.stores.appMeta.serverMetaWalkState
              );
            }

            applyMeta();
          }
        };
      },
      deps: {
        applyMeta: APPLY_META_TOKEN,
      },
    }),
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
