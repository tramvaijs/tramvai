import { createApp, declareAction, provide } from '@tramvai/core';
import { CommonModule, ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/module-common';
import { SpaRouterModule } from '@tramvai/module-router';
import { RenderModule } from '@tramvai/module-render';
import { ServerModule } from '@tramvai/module-server';
import { ErrorInterceptorModule } from '@tramvai/module-error-interceptor';
import { SeoModule } from '@tramvai/module-seo';
import { ClientHintsModule } from '@tramvai/module-client-hints';
import { I18N_CONFIGURATION_TOKEN, I18nModule } from '@tramvai/module-i18n';
import type { I18nRoutingStrategy, I18nLanguageUpdateStrategy } from '@tramvai/module-i18n';
import { RENDER_SLOTS, ResourceType, ResourceSlot } from '@tramvai/tokens-render';

const spaCounterAction = declareAction({
  name: 'spaCounter',
  fn() {
    if (!(window as any).__counter) {
      (window as any).__counter = 0;
    }
    (window as any).__counter += 1;
  },
  conditions: {
    onlyBrowser: true,
    dynamic: true,
  },
});

createApp({
  name: 'i18n',
  modules: [
    CommonModule,
    SpaRouterModule,
    RenderModule.forRoot({ useStrictMode: true }),
    SeoModule,
    ServerModule,
    ErrorInterceptorModule,
    ClientHintsModule,
    I18nModule,
  ],
  actions: [spaCounterAction],
  providers: [
    provide({
      provide: RENDER_SLOTS,
      useValue: {
        type: ResourceType.asIs,
        slot: ResourceSlot.HEAD_META,
        payload: '<meta name="viewport" content="width=device-width, initial-scale=1">',
      },
    }),
    provide({
      provide: I18N_CONFIGURATION_TOKEN,
      useFactory: ({ envManager }) => {
        return {
          defaultLanguage: envManager.get('I18N_DEFAULT_LANGUAGE')!,
          availableLanguages: envManager.get('I18N_AVAILABLE_LANGUAGES')!.split(','),
          routingStrategy: envManager.get('I18N_ROUTING_STRATEGY') as I18nRoutingStrategy,
          updateStrategy: envManager.get('I18N_UPDATE_STRATEGY') as I18nLanguageUpdateStrategy,
          cookieName: 'tramvai_locale',
          resolveLanguagesCommandLineStage: 'customerStart' as const,
          enableAutoRedirect: true,
        };
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      useValue: [
        {
          key: 'I18N_DEFAULT_LANGUAGE',
        },
        {
          key: 'I18N_AVAILABLE_LANGUAGES',
        },
        {
          key: 'I18N_ROUTING_STRATEGY',
        },
        {
          key: 'I18N_UPDATE_STRATEGY',
        },
      ],
    }),
  ],
});
