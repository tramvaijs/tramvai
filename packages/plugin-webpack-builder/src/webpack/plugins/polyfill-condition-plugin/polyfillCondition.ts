import compat from 'core-js-compat';
import { coerce, compare } from 'semver';
import { getSpecToFeatureDict } from './specToFeature';
import { ignoredPolyfills, browsers } from './const';

type BrowserVersions = Record<string, { version: string; spec: string }>;

export function getMaxBrowserVersionsByFeatures(usedFeatures: string[]) {
  const { data } = compat;
  const browserVersions: BrowserVersions = {};

  usedFeatures.forEach((spec) => {
    if (ignoredPolyfills.includes(spec)) {
      return;
    }

    const specBrowsers = data[spec];

    if (!specBrowsers) {
      return;
    }

    browsers.forEach((browserName) => {
      const specVersion = specBrowsers[browserName];
      const coercedMaxVersion =
        browserVersions[browserName] && coerce(browserVersions[browserName].version);
      const coercedSpecVersion = specVersion && coerce(specVersion);
      const successfullyCoerced = coercedMaxVersion && coercedSpecVersion;

      if (
        !browserVersions[browserName] ||
        (successfullyCoerced && compare(coercedMaxVersion, coercedSpecVersion) === -1)
      ) {
        browserVersions[browserName] = { version: specVersion!, spec };
      }
    });
  });

  return browserVersions;
}

export function getPolyfillCondition(browserVersions: BrowserVersions) {
  const supportConditions = new Set();

  Object.values(browserVersions).forEach(({ spec }) =>
    supportConditions.add(`!(${getSpecToFeature(spec)})`)
  );

  const polyfillCondition = [...supportConditions].join(' || ');

  return polyfillCondition;
}

/**
 * Converting the name of the specification into an expression for checking support in runtime
 * es.string.at => String.prototype.at
 * es.object.assign => Object.assign
 */
let specToFeatureDictCache: Record<string, string>;
function getSpecToFeature(spec: string) {
  if (!specToFeatureDictCache) {
    specToFeatureDictCache = getSpecToFeatureDict();
  }

  return specToFeatureDictCache[spec];
}
