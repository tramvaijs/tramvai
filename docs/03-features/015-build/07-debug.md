---
id: Debug-build
title: Debug build
---

## Debug build/cli

To debug the build process, use the following environment variable:

`TRAMVAI_DEBUG_BUILD=true tramvai start app`

In this mode, the build starts with the debugger enabled: the client build uses port `9227`, and the server build uses port `9228`. Note that both builds are started with the `break` flag, so the build process will not begin until you connect a debugger to the process.

If you want to debug only the client or server build, run one build at a time:

`TRAMVAI_DEBUG_BUILD=true tramvai start app -t client`

`TRAMVAI_DEBUG_BUILD=true tramvai start app -t server`

### CPU & Traces

When `TRAMVAI_CPU_PROFILE=1` is enabled, Tramvai generates a CPU profile for the build process: `tramvai.application-<client|server>-webpack-worker.<timestamp>.cpuprofile`, and a profile for the CLI process itself: `tramvai-cli.<timestamp>.cpuprofile`.

With the `TRAMVAI_TRACER_ENABLED=true` flag, Tramvai collects CLI tracing information into the file `tramvai.<timestamp>.trace.json`.

To view traces, use [Perfetto](https://ui.perfetto.dev/).

Note that for Rspack, the build runs in the same process, so build-related data will be included in the CLI CPU profile.

### CLI logs

You can change the logging level of the Tramvai CLI itself using the following environment variable:

`TRAMVAI_LOG_LEVEL=debug tramvai start app`

### Build logs

It is possible to get verbose output almost on every cli command where it is using webpack.

To do this, you should pass `--verboseWebpack` option to command. Check availability of option with help command.

It will pass `{ logging: 'verbose', loggingDebug: true }` to webpack stats config.  
Also, it will turn on [infrastructureLogging](https://webpack.js.org/configuration/other-options/#infrastructurelogging) for webpack with options `{ level: 'verbose', debug: true }`.

### Get details for deprecated and warning logs

It might be useful to get the stacktraces of some of the warnings.

E.g., while running app if you see logs like this

```
(node:2898) DeprecationWarning: ...
(Use `node --trace-deprecation ...` to show where the warning was created)
```

You may add flag `--trace` in order to run nodejs server with the [additional options](https://nodejs.org/dist/latest-v14.x/docs/api/cli.html#cli_trace_warnings).

```sh
tramvai start app --trace
```

After that these logs will be printed with their stacktraces

## Build performance analysis

Tramvai includes special tooling for evaluating build performance via the commands `analyze` and `benchmark`.

### Analyze

`tramvai start --analyze=<plugin>`

Allowed plugin values: `rsdoctor`, `statoscope`, `bundle`, `whybundler`.

To analyze build performance, use `rsdoctor`

It shows statistics for all major build stages and detailed timing information for loaders and plugins.

`Rsdoctor` works as a Webpack plugin and adds a small overhead to the build time. However, the Tramvai configuration of `rsdoctor` is heavily optimized and adds only about 5-7%.

You can also run `analyze` with the `build` command:

`tramvai build --analyze=rsdoctor`

### Benchmark

`tramvai bencmark <command>`

Allowed values: `start`, `build`

`benchmark` provides more reliable measurements of current build performance.

By default, the build runs 3 times. Major build stages and the slowest loaders/plugins are measured, and then the results are averaged.

This produces less volatile timing data, which you can use to make informed decisions.
