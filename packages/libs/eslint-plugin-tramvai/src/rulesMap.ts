const featureToRuleMap: Record<string, string | string[]> = {
  'core-js/modules/es.array.from': 'es-x/no-array-from',
  'core-js/modules/es.array.from-async': 'es-x/no-array-fromasync',
  'core-js/modules/es.array.is-array': 'es-x/no-array-isarray',
  'core-js/modules/es.array.of': 'es-x/no-array-of',
  'core-js/modules/es.array.at': 'es-x/no-array-prototype-at',
  'core-js/modules/es.array.copy-within': 'es-x/no-array-prototype-copywithin',
  // 'es-x/no-array-prototype-entries' - es6
  'core-js/modules/es.array.every': 'es-x/no-array-prototype-every',
  'core-js/modules/es.array.fill': 'es-x/no-array-prototype-fill',
  'core-js/modules/es.array.filter': 'es-x/no-array-prototype-filter',
  'core-js/modules/es.array.find': 'es-x/no-array-prototype-find',
  'core-js/modules/es.array.find-index': 'es-x/no-array-prototype-findindex',
  'core-js/modules/es.array.find-last': 'es-x/no-array-prototype-findlast-findlastindex',
  'core-js/modules/es.array.find-last-index': 'es-x/no-array-prototype-findlast-findlastindex',
  'core-js/modules/es.array.flat': 'es-x/no-array-prototype-flat',
  'core-js/modules/es.array.flat-map': 'es-x/no-array-prototype-flat',
  'core-js/modules/es.array.for-each': 'es-x/no-array-prototype-foreach',
  'core-js/modules/es.array.includes': 'es-x/no-array-prototype-includes',
  'core-js/modules/es.array.index-of': 'es-x/no-array-prototype-indexof',
  // 'es-x/no-array-prototype-keys' - es6
  'core-js/modules/es.array.last-index-of': 'es-x/no-array-prototype-lastindexof',
  'core-js/modules/es.array.map': 'es-x/no-array-prototype-map',
  'core-js/modules/es.array.reduce': 'es-x/no-array-prototype-reduce',
  'core-js/modules/es.array.reduce-right': 'es-x/no-array-prototype-reduceright',
  'core-js/modules/es.array.some': 'es-x/no-array-prototype-some',
  'core-js/modules/es.array.to-reversed': 'es-x/no-array-prototype-toreversed',
  'core-js/modules/es.array.to-sorted': 'es-x/no-array-prototype-tosorted',
  'core-js/modules/es.array.to-spliced': 'es-x/no-array-prototype-tospliced',
  // 'es-x/no-array-prototype-values' - es6
  'core-js/modules/es.array.with': 'es-x/no-array-prototype-with',
  // 'es-x/no-array-string-prototype-at' - deprecated rule
  'core-js/modules/es.array-buffer.transfer': 'es-x/no-arraybuffer-prototype-transfer',
  'core-js/modules/es.async-disposable-stack.constructor': 'es-x/no-asyncdisposablestack',
  // 'es-x/no-atomics' - impossbile to polyfill
  // 'es-x/no-atomics-waitasync' - impossbile to polyfill
  'core-js/modules/es.data-view.get-float16': 'es-x/no-dataview-prototype-getfloat16-setfloat16',
  'core-js/modules/es.data-view.set-float16': 'es-x/no-dataview-prototype-getfloat16-setfloat16',
  'core-js/modules/es.date.now': 'es-x/no-date-now',
  'core-js/modules/es.date.get-year': 'es-x/no-date-prototype-getyear-setyear',
  'core-js/modules/es.date.set-year': 'es-x/no-date-prototype-getyear-setyear',
  'core-js/modules/es.date.to-gmt-string': 'es-x/no-date-prototype-togmtstring',
  'core-js/modules/es.disposable-stack.constructor': 'es-x/no-disposablestack',
  'core-js/modules/es.error.cause': 'es-x/no-error-cause',
  'core-js/modules/es.error.is-error': 'es-x/no-error-iserror',
  // 'es-x/no-escape-unescape' - deprecated

  // https://github.com/petamoriken/float16
  '@petamoriken/float16': 'es-x/no-float16array',
  'core-js/modules/es.function.bind': 'es-x/no-function-prototype-bind',
  'core-js/modules/es.global-this': 'es-x/no-global-this',

  // https://formatjs.github.io/docs/polyfills/
  '@formatjs/intl-datetimeformat/polyfill': [
    'es-x/no-intl-datetimeformat-prototype-formattoparts',
    'es-x/no-intl-datetimeformat-prototype-formatrange',
  ],
  '@formatjs/intl-displaynames/polyfill': 'es-x/no-intl-displaynames',
  '@formatjs/intl-durationformat/polyfill': 'es-x/no-intl-durationformat',
  '@formatjs/intl-getcanonicallocales/polyfill': 'es-x/no-intl-getcanonicallocales',
  '@formatjs/intl-listformat/polyfill': 'es-x/no-intl-listformat',
  '@formatjs/intl-locale/polyfill': 'es-x/no-intl-locale',
  '@formatjs/intl-numberformat/polyfill': [
    'es-x/no-intl-numberformat-prototype-formatrange',
    'es-x/no-intl-numberformat-prototype-formatrangetoparts',
    'es-x/no-intl-numberformat-prototype-formattoparts',
  ],
  '@formatjs/intl-pluralrules/polyfill': [
    'es-x/no-intl-pluralrules',
    'es-x/no-intl-pluralrules-prototype-selectrange',
  ],
  '@formatjs/intl-relativetimeformat/polyfill': 'es-x/no-intl-relativetimeformat',
  '@formatjs/intl-segmenter/polyfill': 'es-x/no-intl-segmenter',
  '@formatjs/intl-enumerator/polyfill': 'es-x/no-intl-supportedvaluesof',
  'core-js/modules/es.iterator.constructor': 'es-x/no-iterator',
  'core-js/modules/es.iterator.drop': 'es-x/no-iterator-prototype-drop',
  'core-js/modules/es.iterator.every': 'es-x/no-iterator-prototype-every',
  'core-js/modules/es.iterator.filter': 'es-x/no-iterator-prototype-filter',
  'core-js/modules/es.iterator.find': 'es-x/no-iterator-prototype-find',
  'core-js/modules/es.iterator.flat-map': 'es-x/no-iterator-prototype-flatmap',
  'core-js/modules/es.iterator.for-each': 'es-x/no-iterator-prototype-foreach',
  'core-js/modules/es.iterator.map': 'es-x/no-iterator-prototype-map',
  'core-js/modules/es.iterator.reduce': 'es-x/no-iterator-prototype-reduce',
  'core-js/modules/es.iterator.some': 'es-x/no-iterator-prototype-some',
  'core-js/modules/es.iterator.take': 'es-x/no-iterator-prototype-take',
  'core-js/modules/es.iterator.to-array': 'es-x/no-iterator-prototype-toarray',
  // 'es-x/no-json' - es6
  // 'es-x/no-json-superset' - es6
  // 'es-x/no-keyword-properties' - es6
  // 'es-x/no-legacy-object-prototype-accessor-methods' - es6
  // 'es-x/no-malformed-template-literals' - es6
  'core-js/modules/es.map': 'es-x/no-map',
  'core-js/modules/es.map.constructor': 'es-x/no-map',
  'core-js/modules/es.map.group-by': 'es-x/no-map-groupby',
  'core-js/modules/es.math.acosh': 'es-x/no-math-acosh',
  'core-js/modules/es.math.asinh': 'es-x/no-math-asinh',
  'core-js/modules/es.math.atanh': 'es-x/no-math-atanh',
  'core-js/modules/es.math.cbrt': 'es-x/no-math-cbrt',
  'core-js/modules/es.math.clz32': 'es-x/no-math-clz32',
  'core-js/modules/es.math.cosh': 'es-x/no-math-cosh',
  'core-js/modules/es.math.expm1': 'es-x/no-math-expm1',
  'core-js/modules/es.math.f16round': 'es-x/no-math-f16round',
  'core-js/modules/es.math.fround': 'es-x/no-math-fround',
  'core-js/modules/es.math.hypot': 'es-x/no-math-hypot',
  'core-js/modules/es.math.imul': 'es-x/no-math-imul',
  'core-js/modules/es.math.log1p': 'es-x/no-math-log1p',
  'core-js/modules/es.math.log2': 'es-x/no-math-log2',
  'core-js/modules/es.math.log10': 'es-x/no-math-log10',
  'core-js/modules/es.math.sign': 'es-x/no-math-sign',
  'core-js/modules/es.math.sinh': 'es-x/no-math-sinh',
  'core-js/modules/es.math.tanh': 'es-x/no-math-tanh',
  'core-js/modules/es.math.trunc': 'es-x/no-math-trunc',
  // 'es-x/no-nonstandard-array-properties' - abstract
  // 'es-x/no-nonstandard-array-prototype-properties' - abstract
  // 'es-x/no-nonstandard-arraybuffer-properties' - abstract
  // 'es-x/no-nonstandard-arraybuffer-prototype-properties' - abstract
  // 'es-x/no-nonstandard-asyncdisposablestack-properties' - abstract
  // 'es-x/no-nonstandard-asyncdisposablestack-prototype-properties' - abstract
  // 'es-x/no-nonstandard-atomics-properties' - abstract
  // 'es-x/no-nonstandard-bigint-properties' - abstract
  // 'es-x/no-nonstandard-bigint-prototype-properties' - abstract
  // 'es-x/no-nonstandard-boolean-properties' - abstract
  // 'es-x/no-nonstandard-boolean-prototype-properties' - abstract
  // 'es-x/no-nonstandard-dataview-properties' - abstract
  // 'es-x/no-nonstandard-dataview-prototype-properties' - abstract
  // 'es-x/no-nonstandard-date-properties' - abstract
  // 'es-x/no-nonstandard-date-prototype-properties' - abstract
  // 'es-x/no-nonstandard-disposablestack-properties' - abstract
  // 'es-x/no-nonstandard-disposablestack-prototype-properties' - abstract
  // 'es-x/no-nonstandard-error-properties' - abstract
  // 'es-x/no-nonstandard-finalizationregistry-properties' - abstract
  // 'es-x/no-nonstandard-finalizationregistry-prototype-properties' - abstract
  // 'es-x/no-nonstandard-function-properties' - abstract
  // 'es-x/no-nonstandard-intl-collator-properties' - abstract
  // 'es-x/no-nonstandard-intl-collator-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-datetimeformat-properties' - abstract
  // 'es-x/no-nonstandard-intl-datetimeformat-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-displaynames-properties' - abstract
  // 'es-x/no-nonstandard-intl-displaynames-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-durationformat-properties' - abstract
  // 'es-x/no-nonstandard-intl-durationformat-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-listformat-properties' - abstract
  // 'es-x/no-nonstandard-intl-listformat-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-locale-properties' - abstract
  // 'es-x/no-nonstandard-intl-locale-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-numberformat-properties' - abstract
  // 'es-x/no-nonstandard-intl-numberformat-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-pluralrules-properties' - abstract
  // 'es-x/no-nonstandard-intl-pluralrules-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-properties' - abstract
  // 'es-x/no-nonstandard-intl-relativetimeformat-properties' - abstract
  // 'es-x/no-nonstandard-intl-relativetimeformat-prototype-properties' - abstract
  // 'es-x/no-nonstandard-intl-segmenter-properties' - abstract
  // 'es-x/no-nonstandard-intl-segmenter-prototype-properties' - abstract
  // 'es-x/no-nonstandard-iterator-properties' - abstract
  // 'es-x/no-nonstandard-iterator-prototype-properties' - abstract
  // 'es-x/no-nonstandard-json-properties' - abstract
  // 'es-x/no-nonstandard-map-properties' - abstract
  // 'es-x/no-nonstandard-map-prototype-properties' - abstract
  // 'es-x/no-nonstandard-math-properties' - abstract
  // 'es-x/no-nonstandard-number-properties' - abstract
  // 'es-x/no-nonstandard-number-prototype-properties' - abstract
  // 'es-x/no-nonstandard-object-properties' - abstract
  // 'es-x/no-nonstandard-promise-properties' - abstract
  // 'es-x/no-nonstandard-promise-prototype-properties' - abstract
  // 'es-x/no-nonstandard-proxy-properties' - abstract
  // 'es-x/no-nonstandard-reflect-properties' - abstract
  // 'es-x/no-nonstandard-regexp-properties' - abstract
  // 'es-x/no-nonstandard-regexp-prototype-properties' - abstract
  // 'es-x/no-nonstandard-set-properties' - abstract
  // 'es-x/no-nonstandard-set-prototype-properties' - abstract
  // 'es-x/no-nonstandard-sharedarraybuffer-properties' - abstract
  // 'es-x/no-nonstandard-sharedarraybuffer-prototype-properties' - abstract
  // 'es-x/no-nonstandard-string-properties' - abstract
  // 'es-x/no-nonstandard-string-prototype-properties' - abstract
  // 'es-x/no-nonstandard-symbol-properties' - abstract
  // 'es-x/no-nonstandard-symbol-prototype-properties' - abstract
  // 'es-x/no-nonstandard-typed-array-properties' - abstract
  // 'es-x/no-nonstandard-typed-array-prototype-properties' - abstract
  // 'es-x/no-nonstandard-weakmap-properties' - abstract
  // 'es-x/no-nonstandard-weakmap-prototype-properties' - abstract
  // 'es-x/no-nonstandard-weakref-properties' - abstract
  // 'es-x/no-nonstandard-weakref-prototype-properties' - abstract
  // 'es-x/no-nonstandard-weakset-properties' - abstract
  // 'es-x/no-nonstandard-weakset-prototype-properties' - abstract
  'core-js/modules/es.number.epsilon': 'es-x/no-number-epsilon',
  'core-js/modules/es.number.is-finite': 'es-x/no-number-isfinite',
  'core-js/modules/es.number.is-integer': 'es-x/no-number-isinteger',
  'core-js/modules/es.number.is-nan': 'es-x/no-number-isnan',
  'core-js/modules/es.number.is-safe-integer': 'es-x/no-number-issafeinteger',
  'core-js/modules/es.number.max-safe-integer': 'es-x/no-number-maxsafeinteger',
  'core-js/modules/es.number.min-safe-integer': 'es-x/no-number-minsafeinteger',
  'core-js/modules/es.number.parse-float': 'es-x/no-number-parsefloat',
  'core-js/modules/es.number.parse-int': 'es-x/no-number-parseint',
  'core-js/modules/es.object.assign': 'es-x/no-object-assign',
  'core-js/modules/es.object.create': 'es-x/no-object-create',
  'core-js/modules/es.object.define-properties': 'es-x/no-object-defineproperties',
  'core-js/modules/es.object.define-property': 'es-x/no-object-defineproperty',
  'core-js/modules/es.object.entries': 'es-x/no-object-entries',
  'core-js/modules/es.object.freeze': 'es-x/no-object-freeze',
  'core-js/modules/es.object.from-entries': 'es-x/no-object-fromentries',
  'core-js/modules/es.object.get-own-property-descriptor':
    'es-x/no-object-getownpropertydescriptor',
  'core-js/modules/es.object.get-own-property-descriptors':
    'es-x/no-object-getownpropertydescriptors',
  'core-js/modules/es.object.get-own-property-names': 'es-x/no-object-getownpropertynames',
  'core-js/modules/es.object.get-own-property-symbols': 'es-x/no-object-getownpropertysymbols',
  'core-js/modules/es.object.get-prototype-of': 'es-x/no-object-getprototypeof',
  'core-js/modules/es.object.group-by': 'es-x/no-object-groupby',
  'core-js/modules/es.object.has-own': 'es-x/no-object-hasown',
  'core-js/modules/es.object.is': 'es-x/no-object-is',
  'core-js/modules/es.object.is-extensible': 'es-x/no-object-isextensible',
  'core-js/modules/es.object.is-frozen': 'es-x/no-object-isfrozen',
  'core-js/modules/es.object.is-sealed': 'es-x/no-object-issealed',
  'core-js/modules/es.object.keys': 'es-x/no-object-keys',
  // 'es-x/no-object-map-groupby' - rule deprecated
  'core-js/modules/es.object.prevent-extensions': 'es-x/no-object-preventextensions',
  'core-js/modules/es.object.seal': 'es-x/no-object-seal',
  'core-js/modules/es.object.set-prototype-of': 'es-x/no-object-setprototypeof',
  // 'es-x/no-object-super-properties' - es6
  'core-js/modules/es.object.values': 'es-x/no-object-values',
  'core-js/modules/es.promise': 'es-x/no-promise',
  'core-js/modules/es.promise.constructor': 'es-x/no-promise',
  'core-js/modules/es.promise.all-settled': 'es-x/no-promise-all-settled',
  'core-js/modules/es.promise.any': 'es-x/no-promise-any',
  'core-js/modules/es.promise.finally': 'es-x/no-promise-prototype-finally',
  'core-js/modules/es.promise.try': 'es-x/no-promise-try',
  'core-js/modules/es.promise.with-resolvers': 'es-x/no-promise-withresolvers',
  // 'es-x/no-property-shorthands' - es6
  // 'es-x/no-reflect' - es6
  'core-js/modules/es.regexp.escape': 'es-x/no-regexp-escape',
  // 'es-x/no-regexp-prototype-compile' - rule deprecated
  'core-js/modules/es.regexp.flags': 'es-x/no-regexp-prototype-flags',
  'core-js/modules/es.regexp.dot-all': 'es-x/no-regexp-s-flag',
  // 'es-x/no-regexp-unicode-property-escapes' - abstract
  // 'es-x/no-regexp-unicode-property-escapes-2019' - abstract
  // 'es-x/no-regexp-unicode-property-escapes-2020' - abstract
  // 'es-x/no-regexp-unicode-property-escapes-2021' - abstract
  // 'es-x/no-regexp-unicode-property-escapes-2022' - abstract
  // 'es-x/no-regexp-unicode-property-escapes-2023' - abstract
  'core-js/modules/es.regexp.sticky': 'es-x/no-regexp-y-flag',
  // 'es-x/no-resizable-and-growable-arraybuffers' - abstract
  'core-js/modules/es.set': 'es-x/no-set',
  'core-js/modules/es.set.constructor': 'es-x/no-set',
  'core-js/modules/es.set.difference.v2': 'es-x/no-set-prototype-difference',
  'core-js/modules/es.set.intersection.v2': 'es-x/no-set-prototype-intersection',
  'core-js/modules/es.set.is-disjoint-from.v2': 'es-x/no-set-prototype-isdisjointfrom',
  'core-js/modules/es.set.is-subset-of.v2': 'es-x/no-set-prototype-issubsetof',
  'core-js/modules/es.set.is-superset-of.v2': 'es-x/no-set-prototype-issupersetof',
  'core-js/modules/es.set.symmetric-difference.v2': 'es-x/no-set-prototype-symmetricdifference',
  'core-js/modules/es.set.union.v2': 'es-x/no-set-prototype-union',
  // 'es-x/no-shadow-catch-param' - abstract
  // 'es-x/no-shared-array-buffer' - abstract
  // 'es-x/no-spread-elements' - abstract
  // 'es-x/no-string-create-html-methods' - abstract
  'core-js/modules/es.string.from-code-point': 'es-x/no-string-fromcodepoint',
  'core-js/modules/es.string.at-alternative': 'es-x/no-string-prototype-at',
  'core-js/modules/es.string.code-point-at': 'es-x/no-string-prototype-codepointat',
  'core-js/modules/es.string.ends-with': 'es-x/no-string-prototype-endswith',
  'core-js/modules/es.string.includes': 'es-x/no-string-prototype-includes',
  'core-js/modules/es.string.is-well-formed': 'es-x/no-string-prototype-iswellformed',
  'core-js/modules/es.string.to-well-formed': [
    'es-x/no-string-prototype-iswellformed-towellformed',
    'es-x/no-string-prototype-towellformed',
  ],
  'core-js/modules/es.string.match-all': 'es-x/no-string-prototype-matchall',
  // 'es-x/no-string-prototype-normalize' - es6
  'core-js/modules/es.string.pad-start': 'es-x/no-string-prototype-padstart-padend',
  'core-js/modules/es.string.pad-end': 'es-x/no-string-prototype-padstart-padend',
  'core-js/modules/es.string.repeat': 'es-x/no-string-prototype-repeat',
  'core-js/modules/es.string.replace-all': 'es-x/no-string-prototype-replaceall',
  'core-js/modules/es.string.starts-with': 'es-x/no-string-prototype-startswith',
  'core-js/modules/es.string.substr': 'es-x/no-string-prototype-substr',
  'core-js/modules/es.string.trim': 'es-x/no-string-prototype-trim',
  'core-js/modules/es.string.trim-right': 'es-x/no-string-prototype-trimleft-trimright',
  'core-js/modules/es.string.trim-left': 'es-x/no-string-prototype-trimleft-trimright',
  'core-js/modules/es.string.trim-end': 'es-x/no-string-prototype-trimstart-trimend',
  'core-js/modules/es.string.trim-start': 'es-x/no-string-prototype-trimstart-trimend',
  'core-js/modules/es.string.raw': 'es-x/no-string-raw',
  // 'es-x/no-subclassing-builtins' - abstract

  // https://www.npmjs.com/package/suppressed-error
  'core-js/modules/es.suppressed-error.constructor': 'es-x/no-suppressederror',
  'core-js/modules/es.symbol': 'es-x/no-symbol',
  'core-js/modules/es.symbol.constructor': 'es-x/no-symbol',
  'core-js/modules/es.symbol.description': 'es-x/no-symbol-prototype-description',
  // 'es-x/no-typed-arrays' - es6
  // 'es-x/no-unicode-codepoint-escapes' - es6
  'core-js/modules/es.weak-map': 'es-x/no-weak-map',
  'core-js/modules/es.weak-map.constructor': 'es-x/no-weak-map',
  'core-js/modules/es.weak-set': 'es-x/no-weak-set',
  'core-js/modules/es.weak-set.constructor': 'es-x/no-weak-set',
  // 'es-x/no-weakrefs' - impossible to polyfill
};

export function featureToRule(featureName: string) {
  if (featureName.startsWith('es')) {
    return featureToRuleMap[`core-js/modules/${featureName}`];
  }

  return featureToRuleMap[featureName];
}

// Список выключенных правил
// их нужно выключать, потому что для их работы нужна транспиляция, а не полифилы
export const disabledRules = [
  'es-x/no-accessor-properties',
  'es-x/no-arbitrary-module-namespace-names',
  'es-x/no-arrow-functions',
  'es-x/no-async-functions',
  'es-x/no-async-iteration',
  'es-x/no-bigint',
  'es-x/no-binary-numeric-literals',
  'es-x/no-block-scoped-functions',
  'es-x/no-block-scoped-variables',
  'es-x/no-class-fields',
  'es-x/no-class-instance-fields',
  'es-x/no-class-private-fields',
  'es-x/no-class-private-methods',
  'es-x/no-class-static-block',
  'es-x/no-class-static-fields',
  'es-x/no-classes',
  'es-x/no-computed-properties',
  'es-x/no-default-parameters',
  'es-x/no-destructuring',
  'es-x/no-json-modules',
  'es-x/no-labelled-function-declarations',
  'es-x/no-logical-assignment-operators',
  'es-x/no-dynamic-import',
  'es-x/no-dynamic-import-options',
  'es-x/no-exponential-operators',
  'es-x/no-export-ns-from',
  'es-x/no-for-of-loops',
  'es-x/no-function-declarations-in-if-statement-clauses-without-block',
  'es-x/no-generators',
  'es-x/no-hashbang',
  'es-x/no-import-attributes',
  'es-x/no-import-meta',
  'es-x/no-initializers-in-for-in',
  'es-x/no-modules',
  'es-x/no-new-target',
  'es-x/no-octal-numeric-literals',
  'es-x/no-optional-catch-binding',
  'es-x/no-optional-chaining',
  'es-x/no-private-in',
  'es-x/no-using-declarations',
  'es-x/no-template-literals',
  'es-x/no-top-level-await',
  'es-x/no-trailing-commas',
  'es-x/no-trailing-dynamic-import-commas',
  'es-x/no-trailing-function-commas',
  'es-x/no-rest-parameters',
  'es-x/no-rest-spread-properties',
  'es-x/no-nullish-coalescing-operators',
  'es-x/no-numeric-separators',
  'es-x/no-proxy',
  'es-x/no-regexp-d-flag',
  'es-x/no-regexp-duplicate-named-capturing-groups',
  'es-x/no-regexp-lookbehind-assertions',
  'es-x/no-regexp-modifiers',
  'es-x/no-regexp-named-capture-groups',
  'es-x/no-regexp-v-flag',
  'es-x/no-regexp-u-flag',
];
