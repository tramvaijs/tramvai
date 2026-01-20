import { I18nConfiguration } from '../types';

export const defaultConfiguration: I18nConfiguration = {
  defaultLanguage: 'ru',
  routingStrategy: 'prefix_except_default',
  updateStrategy: 'reload',
  cookieName: 'tramvai_locale',
  resolveLanguagesCommandLineStage: 'customerStart',
  enableAutoRedirect: true,
};
