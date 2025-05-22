import { BrowserEngine } from '../constants';

/**
 * Possible values :
 * firefox, safari, chrome, other
 *
 * The return type here should be BrowserEngine, not string,
 * but we are not changing it to maintain backward compatibility.
 */
export const getBrowserEngine = (browserName?: string, engineName?: string): string => {
  switch (true) {
    case browserName === 'firefox':
      return BrowserEngine.firefox;
    // If an `engineName` is webkit, and it's not Safari,
    // then define the `browserName` as `safari`, because all browsers
    // on iOS use webkit. Also, we are not handling mobile Safari separately,
    // as it webkit too. See https://en.wikipedia.org/wiki/WebKit
    case browserName === 'safari' || browserName === 'mobile safari' || engineName === 'webkit':
      return BrowserEngine.safari;
    // We aren't using something like `browserName === 'chrome'` here,
    // because there are a lot of browsers based on chromium.
    case engineName === 'blink' || engineName === 'chromium':
      return BrowserEngine.chrome;
  }

  return BrowserEngine.other;
};
