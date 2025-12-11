---
id: build-performance-optimization
title: Build performance optimization
---

# About build

By default, Tramvai uses Webpack and Babel for the build process, which are not known for high performance. There are several options that require manual configuration and testing but can significantly improve build performance.

# Universal

## Update source-map library

Use the latest version of `source-map`.

Source map generation has been sped up via Rust + WASM, but some dependencies still install older versions of `source-map` or `webpack-sources`, causing the older, slower version to "bubble up."

Explicitly install the newer versions in your project:

```json
{
  "source-map": "^0.7.4",
  "webpack-sources": "^3.2.3"
}
```

## SWC transpiler

Use SWC instead of Babel - it's roughly 2× faster because it's written in Rust.

To enable it, add the dependency:

`npx tramvai add --dev @tramvai/swc-integration`

And update your `tramvai.json` config:

```json
"experiments": {
  "transpilation": {
    "loader": "swc"
  }
}
```

If you have issues building with SWC or concerns about its impact on production, you can enable SWC only locally:

```json
"experiments": {
  "transpilation": {
    "loader": {
      "development": "swc",
      "production": "babel"
    }
  }
}
```

# Prod build (CI)

## Separate builds

Split the CI build into separate jobs:

Server:

`tramvai build project -t server`

Client:

`tramvai build project -t client`

This can noticeably speed up the build thanks to parallel execution on separate hosts.

::: caution

After the build, you must also copy `stats.json` from the client build into the server build.

:::

## Disable filesystem cache

Disable webpack’s fileCache option — it only makes sense during local development. In CI, in most cases, there is no benefit in reusing the cache between builds or storing it.

In Tramvai 6+, it is disabled by default in CI.

`yarn tramvai build --fileCache=false`

# Dev build (local)

## Disable sourcemaps

Source map generation significantly impacts build speed.

You can disable it in dev mode:

```json
"sourceMap": {
  "development": false,
  "production": true
}
```

## Disable checkAsyncTs

Type checking, despite running in a separate thread, still negatively affects build performance.

## Selective transpiling

By default, Tramvai performs partial transpilation of dependencies inside `node_modules`.

This mode is called `only-modern`:

```json
{
  "experiments": {
    "transpilation": {
      "include": "only-modern"
    }
  }
}
```

`only-modern` is a special heuristic that tries to determine whether a dependency needs transpilation based on several signals.

However, locally you can disable transpilation entirely since local development is done in the latest version of the browser:

```json
{
  "experiments": {
    "transpilation": {
      "loader": "swc",
      "include": {
        "development": "none",
        "production": "only-modern"
      }
    }
  }
}
```

This speeds up the local build by 20-40% depending on the transpiler.

If you run into issues when disabling transpilation of `node_modules`, you can explicitly list packages that must be transpiled:

```json
{
  "experiments": {
    "transpilation": {
      "loader": "swc",
      "include": {
        "development": ["@tinkoff/request", "@scope/package-name"],
        "production": "only-modern"
      }
    }
  }
}
```

Known packages that need to be transpiled due to the presence of `lazy()`: `@tramvai/module-dev-tools`, `@tramvai-tinkoff/module-notifications`

If you have problems transpiling locally or in CI, you can enable transpilation for all `node_modules`:

```json
{
  "experiments": {
    "transpilation": {
      "loader": "swc",
      "include": {
        "development": "all",
        "production": "all"
      }
    }
  }
}
```

::: caution

It is recommended to avoid using `'all'` because it severely degrades build performance.

:::

## Single runtime chunk

By default, webpack adds its runtime code to the main entrypoint chunk of the bundle — in our case, `platform.js`.

The problem with this approach is that when you make changes that affect an async chunk, webpack still has to rebuild the main chunk because the runtime code also changes.

To avoid unnecessary rebuilds of the main chunk, you can extract the runtime into a separate chunk:

```json
{
  "experiments": {
    "runtimeChunk": "single"
  }
}
```

::: caution

This option affects proudction build and runtime performance, so perform performance measurements before enabling it.

:::

## Worker threads for start command (Tramvai 6+)

Starting from version 6, Tramvai provides a new local development option:

`tramvai start --experimentalWebpackWorkerThreads`

It runs Webpack builds for both client and server in separate threads using `worker_threads`, accelerating cold builds by 30-40%.

# Build performance analysis

Tramvai includes special tooling for evaluating build performance via the commands `analyze` and `benchmark`.

## Analyze

`tramvai start --analyze=<plugin>`

Allowed plugin values: `rsdoctor`, `statoscope`, `bundle`, `whybundler`.

To analyze build performance, use `rsdoctor`

It shows statistics for all major build stages and detailed timing information for loaders and plugins.

`Rsdoctor` works as a Webpack plugin and adds a small overhead to the build time. However, the Tramvai configuration of `rsdoctor` is heavily optimized and adds only about 5-7%.

You can also run `analyze` with the `build` command:

`tramvai build --analyze=rsdoctor`

## Benchmark

`tramvai bencmark <command>`

Allowed values: `start`, `build`

`benchmark` provides more reliable measurements of current build performance.

By default, the build runs 3 times. Major build stages and the slowest loaders/plugins are measured, and then the results are averaged.

This produces less volatile timing data, which you can use to make informed decisions.

# Known build performance issues

## Barrel exports

Some libraries may export their functionality using so-called barrel imports. This approach can significantly slow down build performance and can also lead to incorrect tree shaking.

[Good article](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/) about barrel imports.

We recommend checking your dependencies for such cases (this can be done using `tramvai analyze`) with `rsdoctor` or `statoscope`.
