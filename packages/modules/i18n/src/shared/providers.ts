import { provide, commandLineListTokens, DI_TOKEN } from '@tramvai/core';
import {
  STORE_TOKEN,
  LOGGER_TOKEN,
  COMBINE_REDUCERS,
  REQUEST_MANAGER_TOKEN,
  ENV_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import { COOKIE_MANAGER_TOKEN } from '@tramvai/tokens-cookie';
import { ROUTER_GUARD_TOKEN, ROUTER_PLUGIN, ROUTER_TOKEN } from '@tramvai/tokens-router';
import { USER_LANGUAGE_TOKEN } from '@tramvai/module-client-hints';
import { HTML_ATTRS, RENDER_SLOTS, ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import {
  I18N_CONFIGURATION_TOKEN,
  I18N_TOKEN,
  I18N_RESOLVE_LANGUAGE_TOKEN,
  I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN,
  I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
} from '../tokens';
import { I18nStore, setLanguage, setAvailableLanguages } from './store';
import { I18nServiceImpl } from './service';
import type { Language } from '../types';
import { defaultConfiguration } from './config';
import { LanguageSourcePriority } from './constants';

export const sharedProviders = [
  provide({
    provide: I18N_CONFIGURATION_TOKEN,
    useValue: defaultConfiguration,
  }),
  provide({
    provide: COMBINE_REDUCERS,
    useValue: [I18nStore],
  }),
  provide({
    provide: I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN,
    useFactory: ({ config }) => {
      // TODO: sync with state from server if SSR?
      return async () => config.availableLanguages ?? [config.defaultLanguage];
    },
    deps: {
      config: I18N_CONFIGURATION_TOKEN,
    },
  }),
  provide({
    provide: I18N_TOKEN,
    useClass: I18nServiceImpl,
    deps: {
      store: STORE_TOKEN,
      config: I18N_CONFIGURATION_TOKEN,
      cookieManager: COOKIE_MANAGER_TOKEN,
      router: ROUTER_TOKEN,
      requestManager: REQUEST_MANAGER_TOKEN,
      logger: LOGGER_TOKEN,
    },
  }),
  // Language from cookie has higher priority
  provide({
    provide: I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
    useFactory: ({ cookieManager, config }) => {
      return {
        name: 'cookie',
        priority: LanguageSourcePriority.Cookie,
        resolve: async () => {
          const valueFromCookie = cookieManager.get(config.cookieName!);

          if (typeof valueFromCookie === 'string') {
            return valueFromCookie as Language;
          }
        },
      };
    },
    deps: {
      cookieManager: COOKIE_MANAGER_TOKEN,
      config: I18N_CONFIGURATION_TOKEN,
    },
  }),
  // Then, check user preferences (Accept-Language or navigator.languages)
  provide({
    provide: I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
    useFactory: ({ i18n, userLanguage }) => {
      return {
        name: 'accept-language',
        priority: LanguageSourcePriority.AcceptLanguage,
        resolve: async () => {
          const availableLanguages = i18n.getAvailableLanguages();

          for (let i = 0; i < userLanguage.length; i++) {
            const lang = userLanguage[i];
            // Try exact match first, because userLanguage already sorted by priority
            if (availableLanguages.includes(lang)) {
              return lang as Language;
            }
          }
        },
      };
    },
    deps: {
      i18n: I18N_TOKEN,
      userLanguage: USER_LANGUAGE_TOKEN,
    },
  }),
  // Then, check language from URL (if prefix strategy is used, defined under the hood)
  provide({
    provide: I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
    useFactory: ({ router, requestManager, i18n }) => {
      return {
        name: 'url',
        priority: LanguageSourcePriority.Url,
        resolve: async () => {
          const currentUrl = router.getCurrentUrl() ?? requestManager.getParsedUrl();
          const valueFromUrl = i18n.getLanguageFromUrl(currentUrl);
          const availableLanguages = i18n.getAvailableLanguages();

          if (typeof valueFromUrl === 'string' && availableLanguages.includes(valueFromUrl)) {
            return valueFromUrl as Language;
          }
        },
      };
    },
    deps: {
      router: ROUTER_TOKEN,
      requestManager: REQUEST_MANAGER_TOKEN,
      i18n: I18N_TOKEN,
    },
  }),
  // As a last resort, return default language
  provide({
    provide: I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
    useFactory: ({ config }) => {
      return {
        name: 'default',
        priority: LanguageSourcePriority.Default,
        resolve: async () => {
          return config.defaultLanguage;
        },
      };
    },
    deps: {
      config: I18N_CONFIGURATION_TOKEN,
    },
  }),
  provide({
    provide: I18N_RESOLVE_LANGUAGE_TOKEN,
    useFactory: ({ store, envManager, resolveSources }) => {
      return async () => {
        // At client-side, for SSR mode, we can resolve language from server state
        if (
          typeof window !== 'undefined' &&
          envManager.get('TRAMVAI_FORCE_CLIENT_SIDE_RENDERING') !== 'true'
        ) {
          const { language, source } = store.getState(I18nStore);

          return { language, source };
        }

        const sources = [...resolveSources].sort(({ priority: a }, { priority: b }) => b - a);

        for (const source of sources) {
          const language = await source.resolve();

          if (typeof language === 'string') {
            return {
              language: language as Language,
              source: source.name,
            };
          }
        }

        // Impossible case, because we always have default source
        throw Error('No language could be resolved from any sources');
      };
    },
    deps: {
      store: STORE_TOKEN,
      envManager: ENV_MANAGER_TOKEN,
      resolveSources: I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN,
    },
  }),
  provide({
    provide: commandLineListTokens.init,
    useFactory: ({ di, config, logger }) => {
      const log = logger('i18n');

      return function registerI18nResolveLanguagesCommands() {
        di.register({
          provide: config.resolveLanguagesCommandLineStage
            ? commandLineListTokens[config.resolveLanguagesCommandLineStage]
            : commandLineListTokens.customerStart,
          useFactory: ({
            store,
            resolveAvailableLanguages,
            resolveLanguage,
            cookieManager,
            router,
            requestManager,
            i18n,
          }) => {
            return async function resolveLanguagesFn() {
              // Resolve available languages first, so we can use them to validate current language
              const availableLanguages = await resolveAvailableLanguages();

              log.info(`Resolved available languages: ${availableLanguages}`);

              store.dispatch(setAvailableLanguages(availableLanguages));

              const language = await resolveLanguage();

              log.info(
                `Resolved language: "${language.language}" from "${language.source}" source`
              );

              store.dispatch(setLanguage(language));

              if (!cookieManager.get(config.cookieName!)) {
                log.info(
                  `${config.cookieName!} cookie is not found, save resolved "${language.language}" language to cookie`
                );

                cookieManager.set({
                  name: config.cookieName!,
                  value: language.language,
                  // TODO valid params!
                });
              }

              const currentUrl = router.getCurrentUrl() ?? requestManager.getParsedUrl();
              const languageFromUrl = i18n.getLanguageFromUrl(currentUrl);

              if (typeof languageFromUrl === 'string' && languageFromUrl !== language.language) {
                log.info(
                  `Language "${languageFromUrl}" from current url "${currentUrl}" is not matched to resolved language "${language.language}"`
                );

                if (config.enableAutoRedirect) {
                  log.info(
                    `Sync resolved language with url because 'config.enableAutoRedirect' is enabled`
                  );

                  await i18n.switchLanguage(language.language);
                }
              }
            };
          },
          deps: {
            store: STORE_TOKEN,
            resolveAvailableLanguages: I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN,
            resolveLanguage: I18N_RESOLVE_LANGUAGE_TOKEN,
            cookieManager: COOKIE_MANAGER_TOKEN,
            i18n: I18N_TOKEN,
            router: ROUTER_TOKEN,
            requestManager: REQUEST_MANAGER_TOKEN,
          },
        });
      };
    },
    deps: {
      di: DI_TOKEN,
      config: I18N_CONFIGURATION_TOKEN,
      logger: LOGGER_TOKEN,
    },
  }),
  // Router guard to sync language prefix in URL with current language
  provide({
    provide: ROUTER_GUARD_TOKEN,
    useFactory: ({ logger, i18n, config, cookieManager }) => {
      const log = logger('i18n');

      return async ({ url, to }) => {
        if (typeof window !== 'undefined' && url && to) {
          // i18n store will be updated after navigation, so we need to use cookie to get current language
          const language = cookieManager.get(config.cookieName!)!;
          const languageFromUrl = i18n.getLanguageFromUrl(url.href);

          if (typeof languageFromUrl === 'string' && languageFromUrl !== language) {
            log.info(
              `Language "${languageFromUrl}" from target url "${url.pathname}" is not matched to current language "${language}"`
            );

            if (config.enableAutoRedirect) {
              log.info(
                `Force navigate to url with correct language prefix because 'config.enableAutoRedirect' is enabled`
              );

              const hasLanguagePrefix = typeof languageFromUrl === 'string';
              const targetUrl = hasLanguagePrefix
                ? i18n.addLanguageToUrl(i18n.removeLanguageFromUrl(url), language)
                : i18n.addLanguageToUrl(url, language);

              return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
            }
          }
        }
      };
    },
    deps: {
      logger: LOGGER_TOKEN,
      i18n: I18N_TOKEN,
      config: I18N_CONFIGURATION_TOKEN,
      cookieManager: COOKIE_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: ROUTER_PLUGIN,
    useFactory: ({ config, di, store }) => {
      return {
        apply(router) {
          if (config.updateStrategy === 'update') {
            router.syncHooks.get('change')!.tap('i18n', (_, { navigation }) => {
              // Resolve from DI to avoid circular dependency
              const i18n = di.get(I18N_TOKEN);

              if (navigation.to?.params?.__lang) {
                const currentLang = i18n.getLanguage();
                const nextLang = navigation.to.params.__lang;

                if (currentLang !== nextLang) {
                  store.dispatch(
                    setLanguage({
                      language: navigation.to.params.__lang,
                      source: 'user-interaction',
                    })
                  );
                }
              }
            });
          }

          router.internalHooks['router:resolve-route'].wrap((_, args, next) => {
            // Resolve from DI to avoid circular dependency
            const i18n = di.get(I18N_TOKEN);
            const [navigation, options] = args;

            if (navigation.url) {
              const languageFromUrl = i18n.getLanguageFromUrl(navigation.url);
              const hasLanguagePrefix = typeof languageFromUrl === 'string';

              if (hasLanguagePrefix) {
                // If language is in URL, we need to remove it to resolve the same route for all languages
                const urlWithoutPrefix = i18n.removeLanguageFromUrl(navigation.url);

                const route = next([{ ...navigation, url: urlWithoutPrefix }, options]);

                if (route) {
                  // If route is resolved, we need to save actual url and information about language for logs and debugging
                  route.actualPath = navigation.url.pathname;
                  route.params.__lang = languageFromUrl;
                }

                return route;
              }
              if (config.routingStrategy === 'prefix') {
                // If routing strategy is prefix, we need to send 404 for all urls without language prefix
                return;
              }
            }

            return next(args);
          });
        },
      };
    },
    deps: {
      config: I18N_CONFIGURATION_TOKEN,
      di: DI_TOKEN,
      store: STORE_TOKEN,
    },
  }),
  provide({
    provide: HTML_ATTRS,
    useFactory: ({ i18n }) => {
      return {
        target: 'html' as const,
        attrs: {
          lang: i18n.getLanguage(),
        },
      };
    },
    deps: {
      i18n: I18N_TOKEN,
    },
  }),
  provide({
    provide: RENDER_SLOTS,
    multi: true,
    useFactory: ({ i18n, requestManager }) => {
      const parsedUrl = requestManager.getParsedUrl();
      const url = `${parsedUrl.origin}${parsedUrl.pathname}`;

      // TODO: dynamic list of available languages for specific route to generate alternate links
      // TODO: `x-default` link?
      return [
        {
          type: ResourceType.asIs,
          slot: ResourceSlot.HEAD_META,
          payload: `<link rel="alternate" hreflang="${i18n.getLanguage()}" href="${url}" />`,
        },
      ];
    },
    deps: {
      i18n: I18N_TOKEN,
      requestManager: REQUEST_MANAGER_TOKEN,
    },
  }),
];
