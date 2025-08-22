import { provide } from '@tinkoff/dippy';
import type { ExtractDependencyType } from '@tinkoff/dippy';

import { SpanKind } from '@opentelemetry/api';
import {
  type ChildAppConfigResolutionPlugin,
  type ChildAppConfigResolutionHooks,
  CHILD_APP_CONFIG_RESOLUTION_PLUGIN,
} from '@tramvai/tokens-child-app';
import { OPENTELEMETRY_TRACER_TOKEN } from '../../tokens';

type Tracer = ExtractDependencyType<typeof OPENTELEMETRY_TRACER_TOKEN>;

class ChildAppConfigResolutionOpenTelemetryPlugin implements ChildAppConfigResolutionPlugin {
  private tracer: Tracer;

  constructor({ tracer }: { tracer: Tracer }) {
    this.tracer = tracer;
  }

  apply(hooks: ChildAppConfigResolutionHooks) {
    hooks.fetchConfig.wrap(async (_, payload, next) => {
      return this.tracer.trace(
        'child app fetch config',
        { kind: SpanKind.SERVER },
        async (span) => {
          span.setAttribute('tramvai.scope', 'child_app.fetch_config');
          const configs = await next(payload);
          return configs;
        }
      );
    });
  }
}

export const providers = [
  provide({
    provide: CHILD_APP_CONFIG_RESOLUTION_PLUGIN,
    useClass: ChildAppConfigResolutionOpenTelemetryPlugin,
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
    },
  }),
];
