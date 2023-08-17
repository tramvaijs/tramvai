import type { Browser, Engine, UserAgent } from './types';
import { getBrowserEngine, getMobileOs } from './utils';

const KNOWN_VENDORS = new Set(['Opera', 'Google Chrome', 'Microsoft Edge', 'Firefox', 'Safari']);

const KNOWN_ENGINES = new Set(['Chromium']);

const BACKWARD_COMPATIBILITY_BROWSER_NAME: Record<string, string> = {
  'Google Chrome': 'chrome',
};

const BACKWARD_COMPATIBILITY_OS_NAME: Record<string, string> = {
  macOS: 'Mac OS',
};

const parseQuotedString = (str: string | undefined): string | undefined => {
  if (!str) {
    return str;
  }

  try {
    return JSON.parse(str)?.trim();
  } catch (err) {
    return str;
  }
};

const parseBrowserFromString = (brandsList: string): { browser: Browser; engine: Engine } => {
  const browser: Browser = {
    name: undefined,
    version: undefined,
    major: undefined,
    browserEngine: '',
  };
  const engine: Engine = {
    name: undefined,
    version: undefined,
  };

  brandsList.split(',').forEach((entry) => {
    const [name, version] = entry.split(/;\s*v=/).map(parseQuotedString);

    if (name && KNOWN_VENDORS.has(name)) {
      browser.name = BACKWARD_COMPATIBILITY_BROWSER_NAME[name] ?? name.toLowerCase();
      browser.version = version;
      browser.major = version;
    }

    if (name && KNOWN_ENGINES.has(name)) {
      engine.name = name.toLowerCase();
      engine.version = version;
    }
  });

  if (!browser.name && engine.name) {
    browser.name = engine.name;
    browser.version = engine.version;
  }

  browser.browserEngine = getBrowserEngine(browser.name, engine.name);

  return { browser, engine };
};

const parseBrowserFromUserAgentData = (
  brands: Array<NavigatorUABrandVersion>
): { browser: Browser; engine: Engine } => {
  const browser: Browser = {
    name: undefined,
    version: undefined,
    major: undefined,
    browserEngine: '',
  };
  const engine: Engine = {
    name: undefined,
    version: undefined,
  };

  brands.forEach(({ brand, version }) => {
    if (KNOWN_VENDORS.has(brand)) {
      browser.name = BACKWARD_COMPATIBILITY_BROWSER_NAME[brand] ?? brand.toLowerCase();
      browser.version = version;
      [browser.major] = version.split('.');
    }

    if (KNOWN_ENGINES.has(brand)) {
      engine.name = brand.toLowerCase();
      engine.version = version;
    }
  });

  if (!browser.name && engine.name) {
    browser.name = engine.name;
    browser.version = engine.version;
  }

  browser.browserEngine = getBrowserEngine(browser.name, engine.name);

  return { browser, engine };
};

const getBackwardCompatibleOsName = (payload: string | undefined): string | undefined => {
  if (payload === undefined) {
    return undefined;
  }

  return BACKWARD_COMPATIBILITY_OS_NAME[payload] ?? payload;
};

/**
 *
 * @description
 *
 * Some of the data are available only when additional headers for client-hints were sent from server:
 * - full browser version (only major version is available by default)
 * - OS version
 * - CPU architecture
 * - device model
 *
 * To be able to use data you should first provide header `Accept-CH` with the list of headers that client should send.
 *
 * @param headers
 * @returns
 */
export const parseClientHintsHeaders = (
  headers: Record<string, string | string[] | undefined>
): UserAgent => {
  const { browser, engine } = parseBrowserFromString(
    (headers['sec-ch-ua-full-version-list'] as string) || (headers['sec-ch-ua'] as string)
  );
  const osName = parseQuotedString(headers['sec-ch-ua-platform'] as string);

  const mobileOS = getMobileOs(osName);

  return {
    browser,
    engine,
    os: {
      name: getBackwardCompatibleOsName(osName),
      version: parseQuotedString(headers['sec-ch-ua-platform-version'] as string),
    },
    cpu: {
      architecture: parseQuotedString(headers['sec-ch-ua-arch'] as string),
    },
    mobileOS,
    device: {
      model: parseQuotedString(headers['sec-ch-ua-model'] as string),
      type: headers['sec-ch-ua-mobile'] === '?1' ? 'mobile' : 'desktop',
      vendor: undefined,
    },
    // basically all the browsers with client-hints support
    // also compatible with SameSite=None
    sameSiteNoneCompatible: true,
  };
};

/**
 *
 * @description
 * Some of the data will be available if `UADataValues` were gotten from
 * `getHighEntropyValues` async method, but it's not suitable for all cases.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API
 * @see https://wicg.github.io/ua-client-hints/#user-agent-model
 *
 * @param payload
 *
 * @example
 * const clientHints = parseClientHintsUserAgentData(window.navigator.userAgentData)
 */
export const parseClientHintsUserAgentData = (payload: UADataValues): UserAgent => {
  const { browser, engine } = parseBrowserFromUserAgentData(
    payload.fullVersionList || payload.brands || []
  );

  return {
    browser,
    engine,
    os: {
      name: getBackwardCompatibleOsName(payload.platform),
      version: payload.platformVersion,
    },
    cpu: {
      architecture: payload.architecture,
    },
    mobileOS: getMobileOs(payload.platform),
    device: {
      model: payload.model,
      type: payload.mobile ? 'mobile' : 'desktop',
      vendor: undefined,
    },
    // basically all the browsers with client-hints support
    // also compatible with SameSite=None
    sameSiteNoneCompatible: true,
  };
};
