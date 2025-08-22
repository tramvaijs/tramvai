import { provide, Scope } from '@tinkoff/dippy';
import type { ExtractDependencyType } from '@tinkoff/dippy';

import { SpanKind } from '@opentelemetry/api';
import {
  type ChildAppLoaderPlugin,
  type ChildAppLoaderHooks,
  CHILD_APP_LOADER_PLUGIN,
} from '@tramvai/tokens-child-app';
import { OPENTELEMETRY_TRACER_TOKEN } from '../../tokens';

type Tracer = ExtractDependencyType<typeof OPENTELEMETRY_TRACER_TOKEN>;

class ChildAppLoaderOpenTelemetryPlugin implements ChildAppLoaderPlugin {
  private tracer: Tracer;

  constructor({ tracer }: { tracer: Tracer }) {
    this.tracer = tracer;
  }

  apply(hooks: ChildAppLoaderHooks) {
    hooks.loadModule.wrap(async (_, payload, next) => {
      return this.tracer.trace('child app load', { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'child_app');
        span.setAttribute('tramvai.child_app.name', payload.config.name);
        span.setAttribute('tramvai.child_app.version', payload.config.version);
        span.setAttribute('tramvai.child_app.tag', payload.config.tag);

        span.setAttribute('tramvai.child_app.client.baseUrl', payload.config.client.baseUrl);

        span.setAttribute('tramvai.child_app.client.entry', payload.config.client.entry);
        span.setAttribute('tramvai.child_app.client.stats', payload.config.client.stats);
        span.setAttribute(
          'tramvai.child_app.client.statsLoadable',
          payload.config.client.statsLoadable
        );

        const childApp = await next(payload);
        return childApp;
      });
    });
  }
}

export const providers = [
  provide({
    scope: Scope.SINGLETON,
    provide: CHILD_APP_LOADER_PLUGIN,
    useClass: ChildAppLoaderOpenTelemetryPlugin,
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
    },
  }),
];
