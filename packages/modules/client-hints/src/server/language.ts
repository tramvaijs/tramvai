import uniq from '@tinkoff/utils/array/uniq';
import { provide } from '@tramvai/core';
import { REQUEST_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { USER_LANGUAGE_TOKEN } from '../tokens';

/**
 * Parse Accept-Language header into array of language codes, normalized to ISO-639-1
 * Format: "en-US,en;q=0.9,ru;q=0.8" => ["en", "ru"]
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .filter(Boolean)
    .map((langAndQuality) => {
      const [lang, qualityStr = 'q=1.0'] = langAndQuality.trim().split(';');
      const [_, quality] = qualityStr.split('=');

      return { lang: lang.trim(), quality: parseFloat(quality) };
    })
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.lang.toLowerCase().split('-')[0]);
}

export const serverUserLanguageProvider = provide({
  provide: USER_LANGUAGE_TOKEN,
  useFactory: ({ requestManager }) => {
    const acceptLanguage = requestManager.getHeader('accept-language') as string | undefined;

    if (typeof acceptLanguage !== 'string') {
      return ['ru'];
    }

    return uniq(parseAcceptLanguage(acceptLanguage));
  },
  deps: {
    requestManager: REQUEST_MANAGER_TOKEN,
  },
});
