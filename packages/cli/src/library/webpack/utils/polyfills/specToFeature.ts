import path from 'node:path';
import camelCaseName from '@tinkoff/utils/string/camelCaseName';
import { ignoredPolyfills } from './const';

// built-in-definitions.js file is not listed in the package.json exports of package, so it cannot be imported
// workaround this by using require with an absolute path to file
const pathToDep = require.resolve('babel-plugin-polyfill-corejs3/package.json');
const definitions = require(path.join(path.dirname(pathToDep), '/lib/built-in-definitions.js'));

// A list of new primitives, their support in browsers was added recently
const newPrimitivies = {
  'weak-map': 'window.WeakMap',
  'weak-set': 'window.WeakSet',
  'async-disposable-stack': 'window.AsyncDisposableStack',
  'disposable-stack': 'window.DisposableStack',
  'suppressed-error': 'window.SuppressedError',
  'web.immediate': 'window.setImmediate',
  observable: 'window.Observable',
};

// A list of primitives for which there are no polyfills, but they are needed as a base for methods like JSON.stringify
const missingBuiltIns = {
  ...newPrimitivies,
  'typed-array': 'window.Int8Array',
  'uint8-array': 'window.Uint8Array',
  string: 'window.String',
  array: 'window.Array',
  object: 'window.Object',
  math: 'window.Math',
  function: 'window.Function',
  json: 'window.JSON',
};

// Exclude fetch builtin, because its treated as object.constructor
const excludedBuiltIns = ['fetch'];
const isBuiltInExcluded = (builtInName) => excludedBuiltIns.includes(builtInName);

// Exclude iterators
// we do not provide polyfills for them and their support check is much more complicated
// es.iterator, es.async-iterator, esnext.async-iterator, esnext.iterator
const isSpecExcluded = (specName) =>
  /(es(next)?)?\.(async-)?iterator/.test(specName) || ignoredPolyfills.includes(specName);

const specToFeatureDict = {};
function _addFeature(specName: string, primitive: string, method: string, isInstance: boolean) {
  if (specToFeatureDict[specName]) {
    return;
  }

  let checkExpression = isInstance
    ? `'${method}' in ${primitive}.prototype`
    : `${primitive}.${method}`;

  // For new primitives, we add a check for the existence of the primitive itself.
  // for example WeakMap && WeakMap.from
  // since WeakMap itself may not be supported in the browser, WeakMap check support may also be required
  const isPrimitiveNew = Boolean(Object.values(newPrimitivies).includes(primitive));
  if (isPrimitiveNew) {
    checkExpression = `${primitive} && ${checkExpression}`;
  }

  specToFeatureDict[specName] = checkExpression;
  specToFeatureDict[specName.replace('es.', 'esnext.')] = checkExpression;
}

const addStaticFeature = (specName: string, primitive: string, method: string) =>
  _addFeature(specName, primitive, method, false);
const addInstanceFeature = (specName: string, primitive: string, method: string) =>
  _addFeature(specName, primitive, method, true);

const methods = {};
function addMethod(specName, expression) {
  methods[specName] = expression;
}

const instanceMethods = new Set(['web.url.to-json']);
const globals = new Set();
function _addGlobal(globalList: string[], isInstance: boolean) {
  globalList.forEach((globalSpecName) => {
    globals.add(globalSpecName);

    if (isInstance) {
      instanceMethods.add(globalSpecName);
    }
  });
}
const addInstanceGlobal = (globalList: string[]) => _addGlobal(globalList, true);
const addGlobal = (globalList: string[]) => _addGlobal(globalList, false);

/**
 * For conversion, a dictionary of the form `spec: feature` needs to be created
 * we use a file from babel-plugin-polyfill-corejs3 for this - https://github.com/babel/babel-polyfills/blob/main/packages/babel-plugin-polyfill-corejs3/src/built-in-definitions.ts
 * as a result we get dictinary like { 'es.array.at: 'Array.prototype.at', 'es.object.assign': 'Object.assign' }
 */
export function getSpecToFeatureDict(): Record<string, string> {
  const { BuiltIns, InstanceProperties, StaticProperties } = definitions;

  // JS primitives: Number, Reflect, Set, Map...
  const builtIns = Object.keys(BuiltIns).reduce((acc, builtInKey) => {
    const { name: builtInName, global } = BuiltIns[builtInKey];

    if (isBuiltInExcluded(builtInKey)) return acc;

    addGlobal(global);

    const removeBaseMethodNames = (builtInName) =>
      builtInName.replace('.constructor', '').replace('.to-string', '');

    acc[removeBaseMethodNames(builtInName)] = `window.${builtInKey}`;
    acc[removeBaseMethodNames(builtInName).replace('es.', 'esnext.')] = `window.${builtInKey}`;

    return acc;
  }, {});

  // Some primitives are missing, so we add them manually
  Object.keys(missingBuiltIns).forEach((missingBuiltInName) => {
    builtIns[`es.${missingBuiltInName}`] = `${missingBuiltIns[missingBuiltInName]}`;
    builtIns[`esnext.${missingBuiltInName}`] = `${missingBuiltIns[missingBuiltInName]}`;
  });

  function parseSpec(spec: string) {
    // es.string.push
    const splitName = spec.split('.');
    // es.string
    const builtInName = splitName.slice(0, -1).join('.');
    // String
    const primitiveExpr = builtIns[builtInName];
    // push
    const methodName = splitName.at(-1);

    return {
      builtInName,
      primitiveExpr,
      methodName,
    };
  }

  // Instance methods, for example [1, 2, 3].at(), 'some_string'.toLowerCase()...
  Object.keys(InstanceProperties).forEach((instancePropertyName) => {
    const { name: instanceSpecName, global } = InstanceProperties[instancePropertyName];
    if (isSpecExcluded(instanceSpecName)) return;

    const { primitiveExpr, methodName } = parseSpec(instanceSpecName);

    addMethod(methodName, instancePropertyName);
    addInstanceGlobal(global);

    // Some instance methods have no parent
    // for example Symbol.constructor is es.Symbol
    if (!primitiveExpr) return;

    addInstanceFeature(instanceSpecName, primitiveExpr, instancePropertyName);
  });

  // Static methods for example Object.assign(), RegExp.escape()...
  Object.keys(StaticProperties).forEach((primitiveName) => {
    const staticPrimitiveProperties = StaticProperties[primitiveName];

    Object.keys(staticPrimitiveProperties).forEach((staticPropertyName) => {
      const { name: staticSpecName, global } = staticPrimitiveProperties[staticPropertyName];
      if (isSpecExcluded(staticSpecName)) return;

      const { methodName } = parseSpec(staticSpecName);
      addGlobal(global);
      addMethod(methodName, staticPropertyName);

      // For some reason, several static properties have names that match a builtin
      // we ignore such properties since their support in browsers appeared at the same time as the builtin itself
      // for example Promise and Promise.all
      if (builtIns[staticSpecName]) return;

      addStaticFeature(staticSpecName, primitiveName, staticPropertyName);
    });
  });

  function isFeatureExists(specName) {
    return Boolean(builtIns[specName]) || Boolean(specToFeatureDict[specName]);
  }

  // Each spec has a list of globals, which also need to be converted into an expression for support check
  // but not all globals can have their method name determined unambiguously
  [...globals].forEach((globalSpecName: string) => {
    if (!isFeatureExists(globalSpecName)) {
      if (isSpecExcluded(globalSpecName)) return;

      const { methodName, primitiveExpr, builtInName } = parseSpec(globalSpecName);

      // es.array-buffer.from
      const globalNameSplit = globalSpecName.split('.');

      // Trying to find a support check expression for a method from the already bypassed spec
      // for example, array and typed-array have the findLastIndex method, but typed-array is listed in global
      const featureMethod = methodName === 'constructor' ? 'constructor' : methods[methodName];

      // We consider a method to be simple if its name does not contain a '-'
      // every, filter, map can be left as it is, the method in the language is called the same way
      const isMethodSimple = !/-/.test(methodName);

      // Primitives don't have a method, so its length is 2
      // for example es.symbol или es.string
      const isPrimitive = globalNameSplit.length === 2;
      if (isPrimitive) {
        builtIns[globalSpecName] = `${BuiltIns[globalSpecName]}`;
        return;
      }

      // Trying to determine the type of method from global static or instance
      const globalInstancePrimitives = [
        'es.array-buffer',
        'es.typed-array',
        'es.symbol',
        'web.url-search-params',
        'esnext.weak-map',
        'esnext.weak-set',
        'uint8-array',
      ];
      const isInstanceMethod =
        globalInstancePrimitives.includes(builtInName) || instanceMethods.has(globalSpecName);

      let method: string;
      if (featureMethod) {
        method = featureMethod;
      } else if (isMethodSimple) {
        method = methodName;
      } else if (primitiveExpr) {
        // couldn't find a similar method in the original list and it contains '-'
        // speculatively translating it to camelCase web.url.can-parse => URL.canParse
        method = camelCaseName(methodName);
      }

      isInstanceMethod
        ? addInstanceFeature(globalSpecName, primitiveExpr, method)
        : addStaticFeature(globalSpecName, primitiveExpr, method);
    }
  });

  return fixBrokenSpec({ ...builtIns, ...specToFeatureDict });
}

function fixBrokenSpec(specs: Record<string, string>) {
  specs['es.string.italics'] = "'italics' in window.String.prototype";
  return specs;
}
