import { isNotFoundError, isRedirectFoundError } from '@tinkoff/errors';
import type { ExtractDependencyType } from '@tramvai/core';
import { provide } from '@tramvai/core';
import type { ROUTER_TOKEN } from '@tramvai/tokens-router';
import { ROUTER_PLUGIN } from '@tramvai/tokens-router';
import { SpanKind } from '@opentelemetry/api';
import {
  ATTR_HTTP_ROUTE,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
} from '@opentelemetry/semantic-conventions';
import { FASTIFY_REQUEST } from '@tramvai/tokens-server-private';
import { OPENTELEMETRY_TRACER_TOKEN } from '../tokens';
import { REQUEST_SPAN } from './server';

type Tracer = ExtractDependencyType<typeof OPENTELEMETRY_TRACER_TOKEN>;
type Router = ExtractDependencyType<typeof ROUTER_TOKEN>;
type Request = ExtractDependencyType<typeof FASTIFY_REQUEST>;

function skipError(error: Error) {
  return isRedirectFoundError(error) || isNotFoundError(error);
}

class OpentelemetryRouterPlugin {
  private tracer: Tracer;
  private request: Request;

  constructor({ tracer, request }: { tracer: Tracer; request: Request }) {
    this.tracer = tracer;
    this.request = request;
  }

  apply(router: Router) {
    router.navigateHook.wrap(async (_, payload, next) => {
      return this.tracer.trace(
        `navigate`,
        { kind: SpanKind.SERVER },
        async (span) => {
          const url =
            typeof payload.navigateOptions === 'string'
              ? payload.navigateOptions
              : payload.navigateOptions.url;

          span.setAttribute('tramvai.scope', 'router');

          if (url) {
            span.setAttribute(ATTR_URL_PATH, url);
          }

          await next(payload);
        },
        { skipError }
      );
    });

    // TODO: is updateCurrentRoute tracing necessary at server-side?
    // router.updateHook.wrap(async (_, payload, next) => {
    //   return this.tracer.trace(`update`, { kind: SpanKind.SERVER }, async (span) => {
    //     span.setAttribute('tramvai.scope', 'router');

    //     await next(payload);
    //   });
    // });

    router.runNavigateHook.wrap(async (_, payload, next) => {
      return this.tracer.trace(`run navigate`, { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'router');

        if (payload.navigation.to && payload.navigation.url) {
          const { path } = payload.navigation.to;
          const { pathname, search, href } = payload.navigation.url;

          span.setAttribute(ATTR_HTTP_ROUTE, path);
          span.setAttribute(ATTR_URL_PATH, pathname);
          span.setAttribute(ATTR_URL_QUERY, search.replace('?', ''));
          span.setAttribute(ATTR_URL_FULL, href);

          // bubble current page route to root server request span
          if (this.request[REQUEST_SPAN]) {
            this.request[REQUEST_SPAN].setAttribute(ATTR_HTTP_ROUTE, path);
          }
        }

        await next(payload);
      });
    });

    router.redirectHook.wrap(async (_, payload, next) => {
      return this.tracer.trace(`redirect`, { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'router');

        if (payload.navigation.url) {
          // TODO не корректный урл, как будто уже после модификации
          span.setAttribute('tramvai.router.redirect.from', payload.navigation.fromUrl!.href);
          span.setAttribute('tramvai.router.redirect.to', payload.navigation.url.href);

          if (payload.navigation.code) {
            span.setAttribute('tramvai.router.redirect.code', payload.navigation.code);
          }
        }

        await next(payload);
      });
    });

    router.notfoundHook.wrap(async (_, payload, next) => {
      return this.tracer.trace(`notfound`, { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'router');

        if (payload.navigation.url) {
          span.setAttribute('tramvai.router.notfound.url', payload.navigation.url.href);
        }

        await next(payload);
      });
    });

    router.blockHook.wrap(async (_, payload, next) => {
      return this.tracer.trace(`block`, { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'router');

        if (payload.navigation.url) {
          span.setAttribute('tramvai.router.block.url', payload.navigation.url.href);
        }

        await next(payload);
      });
    });

    for (const [hookName, hook] of router.hooks.entries()) {
      hook.wrap(async (_, payload, next) => {
        return this.tracer.trace(`${hookName} hooks`, { kind: SpanKind.SERVER }, async (span) => {
          span.setAttribute('tramvai.scope', 'router');

          await next(payload);
        });
      });
    }

    router.guards.wrap(async (_, payload, next) => {
      return this.tracer.trace(`guards`, { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'router');

        await next(payload);
      });
    });
  }
}

export const providers = [
  provide({
    provide: ROUTER_PLUGIN,
    useClass: OpentelemetryRouterPlugin,
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
      request: FASTIFY_REQUEST,
    },
  }),
];
