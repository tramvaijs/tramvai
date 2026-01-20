import { createReducer, createEvent } from '@tramvai/state';
import type { Language } from '../types';

export interface I18nStoreState {
  /**
   * Current active language
   */
  language: Language;
  /**
   * Current language source
   */
  source: string;
  /**
   * Available languages whitelist
   */
  availableLanguages: Language[];
}

export const setLanguage = createEvent<{ language: Language; source: string }>('i18n:setLanguage');

export const setAvailableLanguages = createEvent<Language[]>('i18n:setAvailableLanguages');

const initialState: I18nStoreState = {
  language: 'ru',
  source: 'default',
  availableLanguages: [],
};

export const I18nStore = createReducer('tramvai_i18n', initialState)
  .on(setLanguage, (state, language) => ({
    ...state,
    ...language,
  }))
  .on(setAvailableLanguages, (state, availableLanguages) => ({
    ...state,
    availableLanguages,
  }));
