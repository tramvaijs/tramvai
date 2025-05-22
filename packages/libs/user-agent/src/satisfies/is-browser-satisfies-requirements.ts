import isString from '@tinkoff/utils/is/string';
import browserslistTinkoffConfig from '@tinkoff/browserslist-config';
import browserslistFileConfig from '@tramvai/cli/lib/external/browserslist-normalized-file-config';
import { parseUserAgentHeader as parse } from '../parse-user-agent-header/parseUserAgentHeader';
import type { UserAgent } from '../types';
import {
  BROWSERS_LIST_MAP,
  BROWSERS_WITHOUT_COMPLETE_STAT,
  CHROMIUM_BASED_BROWSERS,
  DEVICE_TYPES,
} from './constants';
import type { SatisfiesOptions } from './types';
import { normalizeBrowserslist } from './utils/normalizeBrowserslist';

/*
  The function isBrowserSatisfiesRequirements checks if a given user agent satisfies the specified 
  browser requirements based on a browserslist configuration. It parses the user agent to determine 
  the browser and its version, normalizes the browserslist configuration, and compares the browser 
  version against the specified requirements. The function returns true if the browser meets the requirements, 
  false if it does not, and null if the browser is not found in the browserslist. 
  It also handles special cases for Chromium-based browsers and allows forcing the use of minimum requested 
  versions for browsers with incomplete statistics.
*/
export const isBrowserSatisfiesRequirements = (
  userAgent: UserAgent | string,
  browserslistConfig?: string[],
  { env = 'defaults', forceMinimumUnknownVersions = false }: SatisfiesOptions = {}
): boolean | null => {
  const ua = isString(userAgent) ? parse(userAgent) : userAgent;
  const {
    engine: { name: engineName = '', version: engineVersion },
    device: { type = '' } = {},
  } = ua;
  let { browser: { name: browserName = '', version: browserVersion = '' } = {} } = ua;

  /*
    Chromium based browsers (yandex, samsung, opera, vivaldi, edge) specify the engine version as `Chrome/*'.
    And the engine version (blink) will be converted to the chromium version one-to-one.
    https://github.com/faisalman/ua-parser-js/pull/390
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#Rendering_engine
  */
  if (
    engineName === 'chromium' ||
    (engineName.toLowerCase() === 'blink' &&
      CHROMIUM_BASED_BROWSERS.indexOf(browserName.toLowerCase()) !== -1)
  ) {
    browserName = 'chrome';
    browserVersion = engineVersion || '';
  }

  // parseFloat - it will take away the major + minor versions, discard the rest.
  const checkVersion = parseFloat(browserVersion);
  const deviceType = DEVICE_TYPES[type] || type || DEVICE_TYPES.desktop; // по умолчанию считаем устройство десктопом

  if (!browserName) {
    return null;
  }

  const targets =
    browserslistConfig ?? browserslistFileConfig[env] ?? browserslistTinkoffConfig[env];

  const browsers = normalizeBrowserslist(targets);

  // Browsers from query may not be present in https://caniuse.com/usage-table, and browserslist will return higher versions than requested.
  // Example of this problem - https://github.com/babel/babel/issues/8545
  // It is mean, that for this unknown versions babel will not add specific transforms, but still, transpiled code has a chance to work in required old browsers.
  // And if `satisfies` will be used for example for old browser detection, we can force use minimum requested versions instead of minimum from caniuse data.
  if (forceMinimumUnknownVersions) {
    Object.keys(BROWSERS_WITHOUT_COMPLETE_STAT).forEach((browser) => {
      const target = targets.find((query) => query.startsWith(browser));

      // @todo - respect other browserslist query patterns
      if (target && target.includes('>=')) {
        const [targetBrowser, targetMinVersion] = target.split(' >= ');
        // @ts-expect-error
        const browserKey = BROWSERS_WITHOUT_COMPLETE_STAT[targetBrowser];
        const mappedBrowser = BROWSERS_LIST_MAP[browserKey];

        if (mappedBrowser && browsers[mappedBrowser.name]) {
          if (Number(targetMinVersion) < Number(browsers[mappedBrowser.name][mappedBrowser.type])) {
            browsers[mappedBrowser.name][mappedBrowser.type] = Number(targetMinVersion);
          }
        }
      }
    });
  }

  let hasEntry = false;

  if (browserName in browsers) {
    const browserInfo = browsers[browserName];
    const browserInfoVersion = browserInfo.any ?? browserInfo[deviceType];

    hasEntry = !!browserInfoVersion;

    if (checkVersion >= browserInfoVersion) {
      return true;
    }
  }

  return hasEntry ? false : null; // null means that we did not find a browser match in the browserslist.
};
