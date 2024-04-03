# Experimental settings for @tramvai/cli

With experimental settings you can try some of the new features and options that are not stable for now, but capable to improve usage of cli in some way.

Experimental flags are provided in `tramvai.json` and should be passed separately for `server` and `build` configurations.

`tramvai.json`:

```json
{
  "$schema": "./node_modules/@tramvai/cli/schema.json",
  "projects": {
    "app": {
      "name": "app",
      "root": "src",
      "type": "application",
      "experiments": {
        "minicss": {
          "useImportModule": true
        },
        "webpack": {
          "cacheUnaffected": true
        },
        "transpilation": {
          "loader": {
            "development": "swc",
            "production": "babel"
          }
        }
      }
    }
  }
}
```

## CLI settings

### serverRunner

- `serverRunner="process"|"thread"` - use different ways to run the server app in development mode. "thread" most of the time is faster, but might lead to some bugs, especially when running cli though nodejs api

#### Defaults

- `serverRunner="thread"` - if you get any problems, can switch to "process", it is not experimental and can be safely used

## Webpack settings

Webpack by itself has [a list of experimental flags](https://webpack.js.org/configuration/experiments/#experimentsoutputmodule) which might be passed directly to webpack through `experiments.webpack`.

<!-- TODO: futureDefaults do not work right now because of errors of non-default imports from json -->
<!-- > Take a close look at webpack experimental flag [`futureDefaults`](https://webpack.js.org/configuration/experiments/#experimentsfuturedefaults) which let you to enable all of the experimental webpack features that will be included in the next major release. -->

### Defaults

- `cacheUnaffected=true` - should improve build performance in development mode

## minicss

Flags are specified through `experiments.minicss` and allows to enable experimental settings for [`mini-css-extract-plugin`](https://github.com/webpack-contrib/mini-css-extract-plugin)

- `useImportModule` - enables a special way to compile css modules that should improve build time and decrease memory usage. More details [in the official docs](https://github.com/webpack-contrib/mini-css-extract-plugin#experimentalUseImportModule)

### Defaults

- `useImportModule=true` - enabled by default as this improves build time and provides better css related error descriptions

## transpilation

Settings for the js-ts transpilation process

- `loader="babel"|"swc"` - use specific transpiler

### swc

To use `loader="swc"` you need to install special integration package:

`npx tramvai add --dev @tramvai/swc-integration`

### Defaults

- `loader="babel"` - babel in not experimental setup and can be safely used

## minifier

Settings for the minification process

- `minifier="terser"|"swc"` - use specific [minifier](https://webpack.js.org/plugins/terser-webpack-plugin/#swc) for terser webpack plugin.

### Defaults

- `minifier="terser"` - terser is default minifier for terser plugin
