---
id: telemetry
title: Telemetry
---

## Explanation

Telemetry and distributed tracing is a important part of complete application monitoring.

Tramvai provides a deep integration with [OpenTelemetry](https://opentelemetry.io/) Node.js SDK, with custom automatic instrumentation for internal Node.js modules and core Tramvai mechanisms.

## Usage

### Installation

You need to install `@tramvai/module-opentelemetry`:

```bash npm2yarn
npm i --save @tramvai/module-module-opentelemetry
```

Then connect to the project:

```ts
import { createApp } from '@tramvai/core';
import { OpenTelemetryModule } from '@tramvai/module-opentelemetry';

createApp({
  name: 'tincoin',
  modules: [ OpenTelemetryModule ],
});
```

This will enable OpenTelemetry with automatic instrumentation, and provide `Tracer` into the application.

### Create spans

Simplest way to wrap operation in span is to use `Tracer.trace` method, e.g.:

```ts
import { OPENTELEMETRY_TRACER_TOKEN } from '@tramvai/module-opentelemetry';

const provider = {
  provide: commandLineListTokens.resolvePageDeps,
  useFactory: ({ tracer, apiService }) => {
    return async function getSmth() {
      tracer?.trace('get-smth', async (span) => {
        // set attribute to the span
        span.setAttribute('key', 'value');

        // span will be ended automatically after `apiService.get` method resolves or rejects
        return apiService.get('/smth');
      });
    }
  },
  deps: {
    // tracer exists only server-side
    tracer: optional(OPENTELEMETRY_TRACER_TOKEN),
    apiService: API_SERVICE_TOKEN,
  },
};
```

For more flexibility methods [Tracer.startActiveSpan](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.Tracer.html#startActiveSpan) and [Tracer.startSpan](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api.Tracer.html#startSpan) is available.

`Tracer.trace` and other span creation methods calls can be nested, with [automatic](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-async-hooks) context propagation.

### Export traces

For export traces to OpenTelemetry collector, you need to provide custom span processor and exporter with `OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN` token.

If you have a gRPC collector (e.g. Jaeger), library `@opentelemetry/exporter-trace-otlp-grpc` can be used:

```ts
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN } from '@tramvai/module-opentelemetry';

const provider = {
  provide: OPENTELEMETRY_PROVIDER_SPAN_PROCESSOR_TOKEN,
  useFactory: ({ envManager }) => {
    const url = envManager.get('OTEL_GRPC_COLLECTOR_ENDPOINT');
    const exporter = new OTLPTraceExporter({ url });

    return new BatchSpanProcessor(exporter);
  },
  deps: {
    envManager: ENV_MANAGER_TOKEN,
  },
};
```

### Resource attributes

If you need to extend [resource](https://opentelemetry.io/docs/concepts/resources/) attributes, use `OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN` token. Also, `@opentelemetry/semantic-conventions` library contains some of attribute names.

```ts
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN } from '@tramvai/module-opentelemetry';

const provider = {
  provide: OPENTELEMETRY_PROVIDER_RESOURCE_ATTRIBUTES_TOKEN,
  useFactory: ({ appInfo }) => {
    return {
      [ATTR_SERVICE_NAME]: appInfo.appName,
    }
  },
  deps: {
    appInfo: APP_INFO_TOKEN,
  },
};
```

### Active span

If you need to set attributes to the active span, use `Tracer.getActiveSpan` method:

```ts
// tracer from OPENTELEMETRY_TRACER_TOKEN
function doSmt({ tracer }) {
  const span = tracer.getActiveSpan();

  // span can be absent, for example in `init` or `listen` command line stages
  span?.setAttribute('key', 'value');
}
```

## Automatic instrumentation

[OpenTelemetry instrumentation libraries](https://www.npmjs.com/package/@opentelemetry/instrumentation) is not supported, because of it limitations:
- instrumentations are registered before the module to instrument is require'ed
- modules are not included in a bundle

Instead, module provides custom instrumentation for all significant cases:

### Server module

All incoming requests are automatically wrapped in **root span**, where current request and response parameters will be set (path, method, status code, error).

Naming and attributes follow [semantic conventions](https://opentelemetry.io/docs/specs/semconv/http/http-spans/).

### Context propagation

`OpenTelemetryModule` provides [context propagation](https://opentelemetry.io/docs/languages/js/propagation/) for incoming and outgoing requests.

### Logs correlation

`OpenTelemetryModule` inject context for [logs correlation](https://opentelemetry.io/docs/specs/otel/logs/#log-correlation).

All application logs will be extended with current span and trace ids in `spanId` and `traceId` properties.

## Debug and testing

By default, in `development` mode [ConsoleSpanExporter](https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_sdk_trace_base.ConsoleSpanExporter.html) is used, which prints all spans to the console.

For testing purposes, you can use [InMemorySpanExporter](https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_sdk_trace_base.InMemorySpanExporter.html).
