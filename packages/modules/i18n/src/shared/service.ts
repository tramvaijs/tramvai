import type { COOKIE_MANAGER_TOKEN } from '@tramvai/tokens-cookie';
import { ExtractDependencyType } from '@tinkoff/dippy';
import { LOGGER_TOKEN, REQUEST_MANAGER_TOKEN, STORE_TOKEN } from '@tramvai/tokens-common';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import { Url, parse } from '@tinkoff/url';
import { RedirectFoundError, makeErrorSilent } from '@tinkoff/errors';
import type { I18nService, Language } from '../types';
import { I18nStore } from './store';
import { I18N_CONFIGURATION_TOKEN } from '../tokens';

type Deps = {
  store: ExtractDependencyType<typeof STORE_TOKEN>;
  config: ExtractDependencyType<typeof I18N_CONFIGURATION_TOKEN>;
  cookieManager: ExtractDependencyType<typeof COOKIE_MANAGER_TOKEN>;
  router: ExtractDependencyType<typeof ROUTER_TOKEN>;
  requestManager: ExtractDependencyType<typeof REQUEST_MANAGER_TOKEN>;
  logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
};

export class I18nServiceImpl implements I18nService {
  private store: Deps['store'];
  private config: Deps['config'];
  private cookieManager: Deps['cookieManager'];
  private router: Deps['router'];
  private requestManager: Deps['requestManager'];
  private log: ReturnType<Deps['logger']>;

  constructor(deps: Deps) {
    this.store = deps.store;
    this.config = deps.config;
    this.cookieManager = deps.cookieManager;
    this.router = deps.router;
    this.requestManager = deps.requestManager;
    this.log = deps.logger('i18n');
  }

  getLanguage(): Language {
    const state = this.store.getState(I18nStore);
    return state.language;
  }

  getAvailableLanguages(): Language[] {
    const state = this.store.getState(I18nStore);
    return state.availableLanguages;
  }

  // eslint-disable-next-line max-statements
  async switchLanguage(language: Language): Promise<void> {
    const availableLanguages = this.getAvailableLanguages();

    if (!availableLanguages.includes(language)) {
      // TODO: is throwing an error is a best solution?
      throw new Error(
        `Language "${language}" is not available. Available languages: ${availableLanguages.join(', ')}`
      );
    }

    this.log.info(`Switch language to "${language}"`);

    const { cookieName, routingStrategy, updateStrategy } = this.config;

    this.cookieManager.set({
      name: cookieName!,
      value: language,
      // TODO valid params!
    });

    const currentUrl = this.router.getCurrentUrl() ?? this.requestManager.getUrl();
    const parsedUrl = typeof currentUrl === 'string' ? parse(currentUrl) : currentUrl;
    const currentLanguage = this.getLanguage();
    const languageFromUrl = this.getLanguageFromUrl(parsedUrl);
    const hasLanguagePrefix = typeof languageFromUrl === 'string';
    const targetUrl = hasLanguagePrefix
      ? this.addLanguageToUrl(this.removeLanguageFromUrl(parsedUrl), language)
      : this.addLanguageToUrl(parsedUrl, language);

    const redirectError = new RedirectFoundError({
      nextUrl: `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
      httpStatus: 301,
    });
    makeErrorSilent(redirectError);

    /**
     * 'none' - no action needed, language is already set and url is correct
     * 'reload' - url is correct, reload the page to apply language change
     * 'navigate' - need to update url, navigate to the new URL with/without language prefix
     */
    let action: 'none' | 'reload' | 'navigate' = 'none';

    if (hasLanguagePrefix && languageFromUrl !== language) {
      action = 'navigate';
    } else if (currentLanguage !== language) {
      if (routingStrategy === 'no_prefix') {
        action = 'reload';
      } else {
        action = 'navigate';
      }
    }

    switch (action) {
      case 'none': {
        return;
      }
      case 'reload': {
        if (updateStrategy === 'reload') {
          if (typeof window !== 'undefined') {
            window.location.reload();
            return new Promise(() => {});
          }
          throw redirectError;
        } else {
          if (typeof window !== 'undefined') {
            return this.router.navigate({
              url: targetUrl.href,
              replace: true,
            });
          }
          throw redirectError;
        }
      }
      case 'navigate': {
        if (updateStrategy === 'reload') {
          if (typeof window !== 'undefined') {
            window.location.href = targetUrl.href;
            return new Promise(() => {});
          }
          throw redirectError;
        } else {
          if (typeof window !== 'undefined') {
            return this.router.navigate({
              url: targetUrl.href,
            });
          }
          throw redirectError;
        }
      }
    }
  }

  getLanguageFromUrl(url: string | Url): Language | null {
    const parsedUrl = typeof url === 'string' ? parse(url) : url;
    const { routingStrategy } = this.config;

    const availableLanguages = this.getAvailableLanguages();
    const [firstSegment] = parsedUrl.pathname.split('/').filter(Boolean);
    const isLanguagePrefix = availableLanguages.includes(firstSegment);

    switch (routingStrategy!) {
      case 'no_prefix':
        // No prefix strategy, language is not in URL
        return null;
      case 'prefix':
        // Prefix strategy, first segment should be always a language
        return isLanguagePrefix ? firstSegment : null;
      case 'prefix_and_default':
        // Prefix and default strategy, first segment can be a language, or default language if it not matches
        return isLanguagePrefix ? firstSegment : this.config.defaultLanguage;
      case 'prefix_except_default':
        // Prefix except default strategy, first segment can be a language, but can't match default language
        if (isLanguagePrefix) {
          return firstSegment === this.config.defaultLanguage ? null : (firstSegment as Language);
        }
        return this.config.defaultLanguage;
    }
  }

  removeLanguageFromUrl(url: string | Url): Url {
    const parsedUrl = typeof url === 'string' ? parse(url) : url;
    const languageFromUrl = this.getLanguageFromUrl(parsedUrl);
    const hasLanguagePrefix = typeof languageFromUrl === 'string';

    if (!hasLanguagePrefix) {
      return parsedUrl;
    }
    return parse(
      `${parsedUrl.origin}${parsedUrl.pathname.replace(`/${languageFromUrl}`, '')}${parsedUrl.search}${parsedUrl.hash}`
    );
  }

  addLanguageToUrl(url: string | Url, lang: Language): Url {
    const { routingStrategy } = this.config;
    const parsedUrl = typeof url === 'string' ? parse(url) : url;
    const languageFromUrl = this.getLanguageFromUrl(parsedUrl);
    const hasLanguagePrefix = typeof languageFromUrl === 'string';

    // If the URL already has a language prefix that matches the requested language, return it as is
    // or if routing strategy is 'no_prefix', return it as is
    // or 'prefix_except_default' or 'prefix_and_default' and the language is default, return it as is
    if (
      (hasLanguagePrefix && languageFromUrl === lang) ||
      routingStrategy === 'no_prefix' ||
      (routingStrategy === 'prefix_except_default' && lang === this.config.defaultLanguage) ||
      (routingStrategy === 'prefix_and_default' && lang === this.config.defaultLanguage)
    ) {
      return parsedUrl;
    }
    return parse(
      `${parsedUrl.origin}/${lang}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    );
  }
}
