import { Browser, Engine } from '../../types';
import { getBrowserEngine } from '../../utils/getBrowserEngine';
import {
  BACKWARD_COMPATIBILITY_BROWSER_NAME,
  BACKWARD_COMPATIBILITY_ENGINE_NAME,
  KNOWN_ENGINES,
  KNOWN_VENDORS,
} from '../constants';

/*
  The parseBrowserFromUserAgentData function accepts an array of objects of the NavigatorUABrandVersion type, 
  which contains information about browser brands and versions from the User-Agent data. 
  It analyzes this array to determine the name and version of the browser, as well as the engine it runs on.
*/
export const parseBrowserFromUserAgentData = (
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
      engine.name = BACKWARD_COMPATIBILITY_ENGINE_NAME[brand] ?? brand.toLowerCase();
      engine.version = version;
    }
  });

  if (!browser.name && engine.name) {
    browser.name = engine.name;
    browser.version = engine.version;
  }

  browser.browserEngine = getBrowserEngine(browser.name?.toLowerCase(), engine.name?.toLowerCase());

  return { browser, engine };
};
