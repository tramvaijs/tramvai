import { UAParser } from 'ua-parser-js';
import { UAParserExtensionsTypes, type UserAgent } from '../types';
import { isSameSiteNoneCompatible } from './utils/is-same-site-none-compatible/isSameSiteNoneCompatible';
import { getBrowserEngine } from '../utils/getBrowserEngine';
import { getMobileOs } from '../utils/getMobileOs';
import { toLowerName } from './utils/toLowerName';
import { DeviceType } from '../constants';
import { mergeExtensions } from './utils/mergeExtensions';

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
    result.device.type = DeviceType.mobile;
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
