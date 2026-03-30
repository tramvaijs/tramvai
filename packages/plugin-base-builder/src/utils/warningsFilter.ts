// Occurs when require is used as an expression or stored in a variable inside a library
// In most cases, the warning is triggered by code like:
// const nodeRequire = typeof __non_webpack_require__ === 'undefined' ? require : __non_webpack_require__;
export const REQUIRE_EXPRESSION =
  /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/;

// Occurs when it is impossible to statically analyze the expression passed to require
// and determine which code should be included in the bundle
// Happens in Node libraries that rely on the dynamic nature of CommonJS
export const REQUEST_DYNAMIC = /Critical dependency: the request of a dependency is an expression/;

// Disables warnings for dependencies whose require calls are wrapped in try-catch
// This is usually normal behavior and not a reason to pay attention to the warning
export const MODULE_NOT_FOUND = /Module not found: Error: Can't resolve /;

// Disables warnings for dependencies with incorrect sourcemaps
export const FAILED_TO_PARSE_SM = /Failed to parse source map/;

// Disabled warning for big chunks
export const ASSETS_TOO_BIG =
  /(combined asset size exceeds the recommended limit|exceed the recommended size limit)/;

// Disables warnings for file-system cache, often they occur due to incorrect source-maps in project dependencies
export const SKIPPED_NOT_SERIALIZABLE_CACHE = /Skipped not serializable cache item/;

// Disables the warning caused by using global in core-js
// https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/global-this.js#L13
export const GLOBAL_CHECK = /"global" has been used, it will be undefined in next major version/;

export const ignoreWarnings = [
  { message: REQUIRE_EXPRESSION },
  { message: REQUEST_DYNAMIC },
  { message: MODULE_NOT_FOUND },
  { message: FAILED_TO_PARSE_SM },
  { message: ASSETS_TOO_BIG },
  { message: SKIPPED_NOT_SERIALIZABLE_CACHE },
  { message: GLOBAL_CHECK },
];
