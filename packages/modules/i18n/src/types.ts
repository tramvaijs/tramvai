import { Url } from '@tinkoff/url';

/**
 * Language code in ISO 639-1 format (e.g., 'en', 'ru', 'zh')
 */
export type Language = string;

/**
 * Routing strategy for internationalization
 * @reference https://i18n.nuxtjs.org/docs/guide#strategies
 */
export type I18nRoutingStrategy =
  | 'no_prefix' // No language prefix in URL, language detected by other means
  | 'prefix_except_default' // Prefix for all languages except default (e.g., /en/about, /about)
  | 'prefix' // Prefix for all languages (e.g., /ru/about, /en/about)
  | 'prefix_and_default'; // Prefix for all + additional routes without prefix for default language

/**
 * Strategy for updating the language in the application
 */
export type I18nLanguageUpdateStrategy =
  | 'reload' // Reloads the page to apply language change
  | 'update'; // Updates the URL without reloading, useful for SPA behavior;

/**
 * Configuration for the i18n module
 */
export interface I18nConfiguration {
  /**
   * Default language to use if language cannot be determined
   * @default 'ru'
   */
  defaultLanguage: Language;

  /**
   * Routing strategy for handling language in URLs
   * @default 'prefix_except_default'
   */
  routingStrategy?: I18nRoutingStrategy;

  /**
   * Routing strategy for handling language in URLs
   * @default 'reload'
   */
  updateStrategy?: I18nLanguageUpdateStrategy;

  /**
   * Static list of available languages whitelist. If not provided, only defaultLanguage will be available.
   * Can be overridden by providing I18N_AVAILABLE_LANGUAGES_TOKEN
   */
  availableLanguages?: Language[];

  /**
   * Cookie name for storing selected language
   * @default 'tramvai_locale'
   */
  cookieName?: string;

  /**
   * Command line stage when language and available languages resolution should happen
   * @default 'customerStart'
   */
  resolveLanguagesCommandLineStage?: 'customerStart' | 'resolveUserDeps';

  /**
   * Whether to enable automatic redirect when detected language doesn't match URL language
   * Only applies to prefix-based strategies
   * @default true
   */
  enableAutoRedirect?: boolean;
}

export interface I18nService {
  getLanguage(): Language;
  getAvailableLanguages(): Language[];
  /**
   * @description
   * Returns the language from the `url` if available and match current i18n routing strategy, otherwise returns null.
   */
  getLanguageFromUrl(url: string | Url): Language | null;
  /**
   * @description
   * Navigates to the URL with the specified language prefix and saves the new language to the store and locale cookie
   */
  switchLanguage(language: Language): Promise<void>;
  removeLanguageFromUrl(url: string | Url): Url;
  addLanguageToUrl(url: string | Url, language: Language): Url;
}
