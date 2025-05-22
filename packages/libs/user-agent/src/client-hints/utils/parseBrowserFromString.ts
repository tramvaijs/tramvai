import type { Browser, Engine } from '../../types';
import { getBrowserEngine } from '../../utils/getBrowserEngine';
import {
  BACKWARD_COMPATIBILITY_BROWSER_NAME,
  BACKWARD_COMPATIBILITY_ENGINE_NAME,
  KNOWN_ENGINES,
  KNOWN_VENDORS,
} from '../constants';
import { parseQuotedString } from './parseQuotedString';

/*
  The parseBrowserFromString function accepts a brandsList string that contains information 
  about the browser and its engine in a format where each entry is separated by a comma, 
  and the brand name and version are separated. The function parses this string and returns 
  an object containing information about the browser and its engine.
*/
export const parseBrowserFromString = (
  brandsList: string
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

  brandsList.split(',').forEach((entry) => {
    const [name, version] = entry.split(/;\s*v=/).map(parseQuotedString);

    if (name && KNOWN_VENDORS.has(name)) {
      browser.name = BACKWARD_COMPATIBILITY_BROWSER_NAME[name] ?? name.toLowerCase();
      browser.version = version;
      browser.major = version;
    }

    if (name && KNOWN_ENGINES.has(name)) {
      engine.name = BACKWARD_COMPATIBILITY_ENGINE_NAME[name] ?? name.toLowerCase();
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
