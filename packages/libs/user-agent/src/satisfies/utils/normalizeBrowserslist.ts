import browserslist from 'browserslist';
import { BROWSERS_LIST_MAP } from '../constants';
import { BrowserMap } from '../types';

export const normalizeBrowserslist = (query: string[]) => {
  const resolved = browserslist(query, {
    /*
        We set it to true so that the browserslist returns the full list for mobile browsers, 
        because by default, due to the fact that `Can I use` stores only the latest version of mobile browsers, 
        the browserslist returns only the latest version for mobile devices, 
        and so it will map compliance to the desktop version.
      */
    mobileToDesktop: true,
  })
    /*
        Since ie was removed from the @tinkoff/browserslist-config config, in order to cut off ie, 
        we add a dummy version so that the entire function returns false for any version of ie, 
        and if the regular ie version was set in the custom config or in the config passed as an argument, 
        this dummy version will not affect anything and the custom version will be used.
      */
    .concat(['ie 999']);

  const result: BrowserMap = {};

  for (let i = 0; i < resolved.length; i++) {
    const [name, version] = resolved[i].split(' ');

    if (BROWSERS_LIST_MAP[name]) {
      const { type: mapType, name: mapName } = BROWSERS_LIST_MAP[name];
      const mapVersion = parseFloat(version);

      if (result[mapName]) {
        if (!result[mapName][mapType] || result[mapName][mapType] > mapVersion) {
          result[mapName][mapType] = mapVersion;
        }
      } else {
        result[mapName] = {
          [mapType]: mapVersion,
        };
      }
    }
  }

  return result;
};
