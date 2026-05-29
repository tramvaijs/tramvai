import { Scope, createToken } from '@tramvai/core';
import type { I18nConfiguration, I18nHooks, I18nService, Language } from './types';

export const I18N_CONFIGURATION_TOKEN = createToken<I18nConfiguration>(
  'tramvai i18n configuration',
  { scope: Scope.SINGLETON }
);

export const I18N_TOKEN = createToken<I18nService>('tramvai i18n service');

export const I18N_LANGUAGE_COOKIE_EXPIRES_VALUE = createToken<number>(
  'tramvai i18n language cookie expires value'
);
export const I18N_HOOKS_TOKEN = createToken<I18nHooks>('tramvai i18n tapable hooks', {
  scope: Scope.REQUEST,
});
export const I18N_RESOLVE_LANGUAGE_TOKEN = createToken<
  () => Promise<{
    language: Language;
    source: string;
  }>
>('tramvai i18n resolve language');

export const I18N_RESOLVE_LANGUAGE_SOURCE_TOKEN = createToken<{
  name: string;
  priority: number;
  resolve: () => Promise<Language | undefined>;
}>('tramvai i18n resolve language source', { multi: true });

export const I18N_RESOLVE_AVAILABLE_LANGUAGES_TOKEN = createToken<() => Promise<Language[]>>(
  'tramvai i18n resolve available languages'
);
