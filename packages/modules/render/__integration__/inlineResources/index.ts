import { commandLineListTokens, createApp, provide } from '@tramvai/core';
import {
  HTML_ATTRS,
  RENDER_SLOTS,
  RESOURCES_REGISTRY,
  ResourceSlot,
  ResourceType,
} from '@tramvai/module-render';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import { StorageRecord } from '@tinkoff/htmlpagebuilder';
import { RESOURCE_INLINE_OPTIONS } from '@tramvai/tokens-render';
import { ROUTES_TOKEN } from '@tramvai/tokens-router';
import { ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';

createApp({
  name: 'render',
  modules,
  bundles,
  providers: [
    {
      provide: HTML_ATTRS,
      useValue: {
        target: 'html',
        attrs: {
          class: 'html',
          lang: 'ru',
        },
      },
      multi: true,
    },
    {
      provide: HTML_ATTRS,
      useValue: {
        target: 'body',
        attrs: {
          style: 'display: block; margin: 0;',
        },
      },
      multi: true,
    },
    {
      provide: HTML_ATTRS,
      useValue: {
        target: 'app',
        attrs: {
          'data-attr': 'value',
          bool: true,
        },
      },
      multi: true,
    },
    provide({
      provide: ROUTES_TOKEN,
      multi: true,
      useValue: [{ name: 'sourcemap', path: '/sourcemap' }],
    }),
    provide({
      provide: commandLineListTokens.resolvePageDeps,
      multi: true,
      useFactory: ({ resourcesRegistry, envManager }) => {
        return () => {
          if (typeof window !== 'undefined') return;

          resourcesRegistry.register({
            slot: ResourceSlot.BODY_END,
            type: ResourceType.style,
            payload: `${envManager.get('RESOURCES_API')}123.css`,
          });
        };
      },
      deps: {
        resourcesRegistry: RESOURCES_REGISTRY,
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    {
      provide: RESOURCE_INLINE_OPTIONS,
      useValue: {
        threshold: 10000,
        types: [StorageRecord.style],
      },
    },
  ],
});
