import compat from 'core-js-compat';

// List of ignore polyfills
// they are impossible or very difficult to support check in the browser
export const ignoredPolyfills = [
  'es.json.to-string-tag',
  'es.error.to-string',
  'es.aggregate-error.cause',
  'es.iterator',
  'es.object.to-string',
  'es.array.species',
  'es.date.to-primitive',
  'es.function.has-instance',
  'es.string.at-alternative',
  'es.math.to-string-tag',
  'esnext.math.to-string-tag',
  'es.reflect.to-string-tag',
  'esnext.reflect.to-string-tag',
  'esnext.function.metadata',
  'esnext.composite-key',
  'esnext.composite-symbol',
  'web.dom-collections.for-each',
  'web.dom-collections.iterator',
  'web.dom-exception.to-string-tag',
  'web.dom-exception.stack',
  'es.array.unscopables.flat-map',
  'es.array.unscopables.flat',
  'es.array.push',
  'es.set.difference.v2',
  'es.set.intersection.v2',
  'es.set.is-disjoint-from.v2',
  'es.set.is-subset-of.v2',
  'es.set.is-superset-of.v2',
  'es.set.symmetric-difference.v2',
  'es.set.union.v2',
];

type BrowserName = keyof (typeof compat)['data'][string];

export const browsers: BrowserName[] = [
  'chrome',
  'safari',
  'firefox',
  'opera',
  'edge',
  'chrome-android',
  'ios',
  'opera_mobile',
  'samsung',
];
