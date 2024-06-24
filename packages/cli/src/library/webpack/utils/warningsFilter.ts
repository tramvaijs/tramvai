// возникает когда в либе require используется как выражение или сохраняется в переменной
// в большинстве случаев ворнинг возникает на код вида:
// const nodeRequire = typeof __non_webpack_require__ === 'undefined' ? require : __non_webpack_require__;
export const REQUIRE_EXPRESSION =
  /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/;

// возкникает когда невозможно статически проанализировать выражение, переданное в require и определить
// какой код надо добавить в бандл
// возникает в node-библиотеках, завязанных на динамическую природу commonjs
export const REQUEST_DYNAMIC = /Critical dependency: the request of a dependency is an expression/;

// Отключает ворнинги для зависимостей, require которых обёрнут в try-catch. Обычно это нормально поведение и нет повода отвлекаться на ворнинг
export const MODULE_NOT_FOUND = /Module not found: Error: Can't resolve /;

// Отключает ворнинги для зависимостей, у которых не корректные sourcemaps
export const FAILED_TO_PARSE_SM = /Failed to parse source map/;

// Отключает ворнинги для больших чанков
export const ASSETS_TOO_BIG =
  /(combined asset size exceeds the recommended limit|exceed the recommended size limit)/;

// Disables warnings for file-system cache, often they occur due to incorrect source-maps in project dependencies
export const SKIPPED_NOT_SERIALIZABLE_CACHE = /Skipped not serializable cache item/;

export const ignoreWarnings = [
  { message: REQUIRE_EXPRESSION },
  { message: REQUEST_DYNAMIC },
  { message: MODULE_NOT_FOUND },
  { message: FAILED_TO_PARSE_SM },
  { message: ASSETS_TOO_BIG },
  { message: SKIPPED_NOT_SERIALIZABLE_CACHE },
];
