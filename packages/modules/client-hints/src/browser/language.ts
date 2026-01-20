import uniq from '@tinkoff/utils/array/uniq';
import { provide } from '@tramvai/core';
import { USER_LANGUAGE_TOKEN } from '../tokens';

export const browserUserLanguageProvider = provide({
  provide: USER_LANGUAGE_TOKEN,
  useFactory: () => {
    if (typeof navigator === 'undefined' || !navigator.languages) {
      return ['ru'];
    }

    const languages = Array.from(navigator.languages).map((lang) => {
      // Normalize language codes to ISO-639-1
      return lang.toLowerCase().split('-')[0];
    });

    return uniq(languages);
  },
});
