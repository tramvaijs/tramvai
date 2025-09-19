import propOr from '@tinkoff/utils/object/propOr';
import compose from '@tinkoff/utils/function/compose';
import toLower from '@tinkoff/utils/string/toLower';
import { UAParser } from 'ua-parser-js';
import type { UAParserExtensionsTypes, UserAgent } from './types';
import { isSameSiteNoneCompatible } from './isSameSiteNoneCompatible';
import { mergeExtensions } from './utils/merge-extensions';
import { getBrowserEngine } from './utils/get-browser-engine';
import { getMobileOs } from './utils/get-mobile-os';

const toLowerName = compose(toLower, propOr('name', ''));

export const parseUserAgentHeader = (
  userAgent: string,
  extensions?: UAParserExtensionsTypes[] | null
): UserAgent => {
  const { ua, ...result } = new UAParser(userAgent, {
    ...mergeExtensions(extensions || []),
  }).getResult();

  const { browser, os, engine } = result;

  const browserName = toLowerName(browser);
  const engineName = toLowerName(engine);

  if (browserName === 'opera mobi') {
    result.device.type = 'mobile';
  }

  return {
    ...result,
    mobileOS: getMobileOs(os.name),
    sameSiteNoneCompatible: isSameSiteNoneCompatible(result),
    browser: {
      ...browser,
      browserEngine: getBrowserEngine(browserName, engineName),
      name: browserName,
    },
  };
};
