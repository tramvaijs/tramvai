// imports from core-js will transform by [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env#usebuiltins-entry) in more specific,
import 'core-js/modules/es.aggregate-error';

import 'core-js/modules/es.array.at';
import 'core-js/modules/es.array.concat';
import 'core-js/modules/es.array.copy-within';
import 'core-js/modules/es.array.fill';
import 'core-js/modules/es.array.filter';
import 'core-js/modules/es.array.find-index';
import 'core-js/modules/es.array.find';
import 'core-js/modules/es.array.flat-map';
import 'core-js/modules/es.array.flat';
import 'core-js/modules/es.array.from';
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.array.index-of';
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.array.last-index-of';
import 'core-js/modules/es.array.map';
import 'core-js/modules/es.array.of';
import 'core-js/modules/es.array.reduce-right';
import 'core-js/modules/es.array.reduce';
import 'core-js/modules/es.array.reverse';
import 'core-js/modules/es.array.slice';
import 'core-js/modules/es.array.sort';
import 'core-js/modules/es.array.species';
import 'core-js/modules/es.array.splice';
import 'core-js/modules/es.array.unscopables.flat-map';
import 'core-js/modules/es.array.unscopables.flat';

import 'core-js/modules/es.json.stringify';
import 'core-js/modules/es.json.to-string-tag';

import 'core-js/modules/es.map';

import 'core-js/modules/es.math.to-string-tag';

import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.object.define-getter';
import 'core-js/modules/es.object.define-setter';
import 'core-js/modules/es.object.entries';
import 'core-js/modules/es.object.freeze';
import 'core-js/modules/es.object.from-entries';
import 'core-js/modules/es.object.get-own-property-descriptor';
import 'core-js/modules/es.object.get-own-property-descriptors';
import 'core-js/modules/es.object.get-own-property-names';
import 'core-js/modules/es.object.get-prototype-of';
import 'core-js/modules/es.object.has-own';
import 'core-js/modules/es.object.is-extensible';
import 'core-js/modules/es.object.is-frozen';
import 'core-js/modules/es.object.is-sealed';
import 'core-js/modules/es.object.keys';
import 'core-js/modules/es.object.lookup-getter';
import 'core-js/modules/es.object.lookup-setter';
import 'core-js/modules/es.object.prevent-extensions';
import 'core-js/modules/es.object.seal';
import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.object.values';

import 'core-js/modules/es.promise.all-settled';
import 'core-js/modules/es.promise.any';
import 'core-js/modules/es.promise.finally';
import 'core-js/modules/es.promise';

import 'core-js/modules/es.reflect.to-string-tag';

import 'core-js/modules/es.regexp.exec';

import 'core-js/modules/es.set';

import 'core-js/modules/es.string.at-alternative';
import 'core-js/modules/es.string.code-point-at';
import 'core-js/modules/es.string.ends-with';
import 'core-js/modules/es.string.from-code-point';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/es.string.iterator';
import 'core-js/modules/es.string.match-all';
import 'core-js/modules/es.string.match';
import 'core-js/modules/es.string.pad-end';
import 'core-js/modules/es.string.pad-start';
import 'core-js/modules/es.string.raw';
import 'core-js/modules/es.string.repeat';
import 'core-js/modules/es.string.replace-all';
import 'core-js/modules/es.string.replace';
import 'core-js/modules/es.string.search';
import 'core-js/modules/es.string.split';
import 'core-js/modules/es.string.starts-with';
import 'core-js/modules/es.string.trim-end';
import 'core-js/modules/es.string.trim-start';
import 'core-js/modules/es.string.trim';

import 'core-js/modules/es.symbol.async-iterator';
import 'core-js/modules/es.symbol.description';
import 'core-js/modules/es.symbol.has-instance';
import 'core-js/modules/es.symbol.is-concat-spreadable';
import 'core-js/modules/es.symbol.iterator';
import 'core-js/modules/es.symbol';
import 'core-js/modules/es.symbol.match-all';
import 'core-js/modules/es.symbol.match';
import 'core-js/modules/es.symbol.replace';
import 'core-js/modules/es.symbol.search';
import 'core-js/modules/es.symbol.species';
import 'core-js/modules/es.symbol.split';
import 'core-js/modules/es.symbol.to-primitive';
import 'core-js/modules/es.symbol.to-string-tag';
import 'core-js/modules/es.symbol.unscopables';

import 'core-js/modules/es.weak-map';
import 'core-js/modules/es.weak-set';

import 'core-js/modules/web.dom-collections.iterator';
import 'core-js/modules/web.queue-microtask';

import 'core-js/modules/web.url-search-params';

import 'core-js/modules/web.url';
import 'core-js/modules/web.url.to-json';

import 'abort-controller/polyfill';

import 'intersection-observer';

// CSS variables

import cssVars from 'css-vars-ponyfill';

cssVars();

// Web API

if (typeof window !== 'undefined') {
  // Polyfill doesn't add ResizeObserver to the window
  if (!window.ResizeObserver) {
    window.ResizeObserver = require('resize-observer-polyfill').default;
  }
}
