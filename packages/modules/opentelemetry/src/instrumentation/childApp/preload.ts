import { provide } from '@tinkoff/dippy';
import type { ExtractDependencyType } from '@tinkoff/dippy';

import { SpanKind } from '@opentelemetry/api';
import {
  type ChildAppPreloadManagerPlugin,
  type ChildAppPreloadHooks,
  CHILD_APP_PRELOAD_MANAGER_PLUGIN,
} from '@tramvai/tokens-child-app';
import { OPENTELEMETRY_TRACER_TOKEN } from '../../tokens';

type Tracer = ExtractDependencyType<typeof OPENTELEMETRY_TRACER_TOKEN>;

class ChildAppPreloadManagerOpenTelemetryPlugin implements ChildAppPreloadManagerPlugin {
  private tracer: Tracer;

  constructor({ tracer }: { tracer: Tracer }) {
    this.tracer = tracer;
  }

  apply(hooks: ChildAppPreloadHooks) {
    hooks.preloadChildApp.wrap(async (_, payload, next) => {
      return this.tracer.trace('child app preload', { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'child_app');
        span.setAttribute('tramvai.child_app.name', payload.config.name);
        span.setAttribute('tramvai.child_app.version', payload.config.version);
        span.setAttribute('tramvai.child_app.tag', payload.config.tag);

        await next(payload);
      });
    });

    hooks.runChildAppCommandLine.wrap(async (_, payload, next) => {
      return this.tracer.trace(
        'child app run command line',
        { kind: SpanKind.SERVER },
        async (span) => {
          span.setAttribute('tramvai.scope', 'child_app');

          span.setAttribute('tramvai.child_app.name', payload.config.name);
          span.setAttribute('tramvai.child_app.version', payload.config.version);
          span.setAttribute('tramvai.child_app.tag', payload.config.tag);

          span.setAttribute('tramvai.child_app.line', payload.line);
          span.setAttribute('tramvai.child_app.status', payload.status);
          await next(payload);
        }
      );
    });
  }
}

export const providers = [
  provide({
    provide: CHILD_APP_PRELOAD_MANAGER_PLUGIN,
    useClass: ChildAppPreloadManagerOpenTelemetryPlugin,
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
    },
  }),
];
