---
id: Debugging
title: Debugging
---

## Debug client side code

### Sourcemaps

To debug client-side code, use the standard browser DevTools. For more convenient debugging, you can enable source maps with an option in `tramvai.json`:

```json
{
  "$schema": "../../node_modules/@tramvai/cli/schema.json",
  "analytics": {
    "enabled": false
  },
  "projects": {
    "projectName": {
      "sourceMap": {
        "development": false,
        "production": true
      }
    }
  }
}
```

By default, the [webpack devtool](https://webpack.js.org/configuration/devtool/) setting `source-maps` is used for the client build and `inline-source-maps` for the server build.

You can also specify a particular `devtool` value (`sourceMap` has higher priority):

```json
{
  "$schema": "../../node_modules/@tramvai/cli/schema.json",
  "analytics": {
    "enabled": false
  },
  "projects": {
    "projectName": {
      "webpack": {
        "devtool": "eval-cheap-module-source-map"
      }
    }
  }
}
```

`webpack` offers several kind of [sourcemap qualities](https://webpack.js.org/configuration/devtool/#qualities). Some of the examples are:

1. Source code - the code before transpilation and bundling. Snapshot of the source code, splitted by modules
2. Transformed code - the code after transpilation by loaders (etc. babel-loader), splitted by modules
3. Generated code - the code after transpilation and bundling, splitted by modules. Every import and exported are replaced by webpack wrapper code

For development source maps for transformed or generated code is used as it is more performant and shows the exact code that is executed in the target environment. The main differences from the debugging without sourcemaps is that code has links to modules to original source files.

For development builds, it is recommended to disable source maps completely and use a more performant `devtool` configuration:

```json
{
  "$schema": "../../node_modules/@tramvai/cli/schema.json",
  "analytics": {
    "enabled": false
  },
  "projects": {
    "projectName": {
      "sourceMap": {
        "development": false
      },
      "webpack": {
        "devtool": "eval-source-map"
      }
    }
  }
}
```

### Production debug

For debugging client-side code in production, we recommend using the Chrome DevTools [Overrides](https://developer.chrome.com/docs/devtools/overrides) feature to modify the required JS, CSS, or root HTML files.

When debugging with Overrides, you may encounter an integrity mismatch after modifying a script's contents.

To avoid this, create an override for the root HTML file and simply remove the integrity attributes from all script tags. You can do this with the following regular expression `integrity=".+?"`.

For easier debugging, you can also use source maps. To do this, locate the build artifacts for the current release and download the source maps locally (don't forget to enable source map generation in the Tramvai config).

To connect source maps locally, follow the [instructions](https://developer.chrome.com/docs/devtools/developer-resources).

## Debug server side code

When running `tramvai start`, Tramvai launches server-side code in a separate process or worker thread. For debugging, follow any Node.js debugging guide, for example [this one](https://nodejs.org/learn/getting-started/debugging).

To start the inspector inside the worker that executes your code, use the following CLI argument:

`tramvai start app --debug`

When the `debug` flag is enabled, build caches are automatically disabled and source maps are enabled unless they are explicitly turned off.

Alternatively, use an environment variable:

`TRAMVAI_DEBUG=1 tramvai start app`

The variable can also accept `--inspect` values such as `break` and `wait` ([docs](https://nodejs.org/en/learn/getting-started/debugging#command-line-options)).

`TRAMVAI_DEBUG=wait tramvai start app`

For debugging, we recommend using [Chrome DevTools](https://nodejs.org/learn/getting-started/debugging#chrome-devtools-55-microsoft-edge). By default, Tramvai uses port `9229` for server-side debugging.

:::note

Env `TRAMVAI_DEBUG` working only for tramvai v7+ or `--experimentalWebpackWorkerThreads`

:::

### Debugging while making changes

Whenever server-side code changes, a full restart occurs: the worker executing the code is completely terminated and a new one is created with the updated code. The problem is that restarting the worker also recreates the connection between DevTools and Node.js, so you have to reconnect the debugger after every change.

To avoid reconnecting every time, Tramvai provides an experimental startup flag designed to simplify debugging:

`TRAMVAI_DEBUG=1 tramvai start app --serverHot`

In this mode, Tramvai does not fully restart the worker when server-side code changes. Instead, it shuts down the currently running code and initializes the new version, so the connection between DevTools and Node.js remains active, which greatly simplifies debugging.

The downside of this approach is that many third-party libraries and some Tramvai modules are not designed to be fully restarted within the same process and instead assume a complete process shutdown. As a result, memory leaks and incorrect behavior in some external modules are possible, which may eventually lead to an OOM crash.

### CPU

To generate a CPU profile for server-side code, use the following environment variable:

`TRAMVAI_CPU_PROFILE=1 tramvai start app`

When the process exits, a file named `tramvai.server-runner-worker.<timestamp>.cpuprofile` will be generated and can be opened in [Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/nodejs).

You can also record the profile manually by running in debug mode and using Chrome DevTools.

[Complete guide to tramvai apps CPU profiling](guides/server-optimization/cpu-profiling.md)

### Memory

To capture a memory snapshot, use debug mode and the [Memory tab](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots) in Chrome DevTools.

[Complete guide to tramvai apps memory leak debugging](guides/server-optimization/memory-profiling.md)

[Complete guide to tramvai cpu and memory profiling module](guides/server-optimization/runtime-profiling.md) that uses the [Node.js Inspector](https://nodejs.org/api/inspector.html)

### Production build

For debugging in production, we recommend using [logging](03-features/014-monitoring/01-logging.md).

Tramvai also provides an integration module for [OpenTelemetry](03-features/014-monitoring/03-telemetry.md) and a brief [guide](how-to/how-debug-modules.md) on logging module execution.

### Production profiling for React

```bash
TRAMVAI_REACT_PROFILE=1 tramvai build app
# or
TRAMVAI_REACT_PROFILE=1 tramvai start-prod app
```

After that, you can use the React DevTools Profiler in the same way as you would in development.

WARNING: The size of the bundle will be larger, because mangling is disabled for such builds. Do not use this env variable for production environment.

Documentation:

- [How to use React Profiler](https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
- [Introducing a new React profiler (React 18)](https://github.com/reactwg/react-18/discussions/76)
- [React DevTools tutorial](https://react-devtools-tutorial.vercel.app/)

## Bundle stats analyze

Tramvai includes special tooling for stats analysis via the command `analyze`.

### Analyze

`tramvai start --analyze=<plugin>`

Allowed plugin values: `rsdoctor`, `statoscope`, `bundle`, `whybundler`.

To analyze bundle stats, use `statoscope`

[Complete guide](references/cli/analyze.md) to bundle analysis.
