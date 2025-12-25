import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions';
import { propagation, SpanStatusCode, type Span, SpanKind, ROOT_CONTEXT } from '@opentelemetry/api';
// @ts-ignore
import pathToRegexp from 'path-to-regexp';
import flatten from '@tinkoff/utils/array/flatten';
import { isHttpError, isNotFoundError } from '@tinkoff/errors';
import { provide } from '@tramvai/core';
import { UTILITY_SERVER_PATHS } from '@tramvai/tokens-server';
import {
  WEB_FASTIFY_APP_TOKEN,
  WEB_FASTIFY_APP_INIT_TOKEN,
  WEB_FASTIFY_APP_AFTER_ERROR_TOKEN,
} from '@tramvai/tokens-server-private';
import { ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';
import { OPENTELEMETRY_TRACER_TOKEN } from '../tokens';

export const REQUEST_SPAN = Symbol('opentelemetry.tramvai.server.request.span');

declare module 'fastify' {
  interface FastifyRequest {
    [REQUEST_SPAN]?: Span;
  }
}

export const providers = [
  provide({
    provide: WEB_FASTIFY_APP_INIT_TOKEN,
    useFactory: ({ app, tracer, tracesExcludePaths, envManager }) => {
      return () => {
        // todo copypaste from @tinkoff/measure-fastify-requests
        const excludePatterns = flatten(tracesExcludePaths).map((p) => pathToRegexp(p));

        app.addHook('onRequest', (req, reply, done) => {
          // skip traces for healthchecks
          if (excludePatterns.some((p) => p.test(req.url))) {
            done();
            return;
          }

          // propagate context from incoming request
          // https://opentelemetry.io/docs/languages/js/propagation/#manual-context-propagation
          const activeContext = propagation.extract(ROOT_CONTEXT, req.headers);

          const httpMethod = req.method;
          // todo useful because always get `*`, rewrite with tramvai router route?
          const httpRoute = req.routeOptions?.url
            ? req.routeOptions.url // since fastify@4.10.0
            : // @ts-ignore
              req.routerPath;
          const parsedUrl = new URL(`http://localhost${req.url}`);

          // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#name
          tracer.startActiveSpan(
            `${httpMethod} ${httpRoute === '*' ? 'APP' : httpRoute}`,
            // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#http-server-semantic-conventions
            { kind: SpanKind.SERVER },
            activeContext,
            (span) => {
              req[REQUEST_SPAN] = span;

              // todo: move custom tramvai attrs to constants
              /**
               * let's add some conventions for tramvai attributes:
               * - `tramvai` prefix for all specific attributes in tramvai instrumentation
               * - `tramvai.scope` second prefix to define module, e.g. `tramvai.scope: server`
               * - `tramvai.*` second prefix for specific modules, e.g. `tramvai.server`
               * - `tramvai.server.handler` - `app` value for pages handler, another possible values - `papi`, `request-limiter`
               * - `tramvai.server.framework` - reserved for future, if we will add support for other server frameworks
               */
              span.setAttribute('tramvai.scope', 'server');
              span.setAttribute('tramvai.server.handler', 'app');
              span.setAttribute('tramvai.server.framework', 'fastify');

              // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/attributes-registry/http.md
              span.setAttribute(ATTR_HTTP_REQUEST_METHOD, httpMethod);
              span.setAttribute(
                ATTR_SERVER_ADDRESS,
                req.headers['x-original-host'] || req.headers.host || envManager.get('PORT')!
              );
              span.setAttribute(ATTR_SERVER_PORT, envManager.get('PORT')!);

              // route should have low-cardinality - https://github.com/open-telemetry/semantic-conventions/blob/main/docs/attributes-registry/http.md
              span.setAttribute(ATTR_HTTP_ROUTE, httpRoute);
              span.setAttribute(ATTR_URL_PATH, parsedUrl.pathname);
              span.setAttribute(ATTR_URL_QUERY, parsedUrl.search.replace('?', ''));
              span.setAttribute(ATTR_URL_SCHEME, parsedUrl.protocol.replace(':', ''));
              span.setAttribute(ATTR_URL_FULL, parsedUrl.href);

              done();
            }
          );
        });

        app.addHook('onResponse', (req, reply) => {
          if (req[REQUEST_SPAN]) {
            const span = req[REQUEST_SPAN];

            if (reply.statusCode >= 400) {
              // span will be updated and ended in `WEB_FASTIFY_APP_AFTER_ERROR_TOKEN` handler
            } else {
              span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, reply.statusCode);
              // todo req/res headers?
              span.end();
            }
          }
        });
      };
    },
    deps: {
      app: WEB_FASTIFY_APP_TOKEN,
      tracer: OPENTELEMETRY_TRACER_TOKEN,
      tracesExcludePaths: UTILITY_SERVER_PATHS,
      envManager: ENV_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: WEB_FASTIFY_APP_AFTER_ERROR_TOKEN,
    useFactory: (deps) => {
      return (error, req, reply) => {
        if (req[REQUEST_SPAN]) {
          const span = req[REQUEST_SPAN];
          let httpStatus: number;

          // todo duplicated logic from packages/modules/server/src/server/error/prepareLogsForError.ts
          if (isNotFoundError(error)) {
            httpStatus = error.httpStatus || 404;
          } else if (isHttpError(error)) {
            httpStatus = error.httpStatus || 500;
          } else {
            httpStatus = error.statusCode || 500;
          }

          span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, httpStatus);
          // todo req/res headers?
          // todo "error.type" attribute?

          // do not set error status for incoming requests with 4xx status
          // https://opentelemetry.io/docs/specs/semconv/http/http-spans/#status
          if (httpStatus >= 500) {
            span.recordException(error);

            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error?.message ?? 'Unknown error',
            });
          }

          span.end();

          // todo RootErrorBoundary is out of scope, because it is rendered after `WEB_FASTIFY_APP_AFTER_ERROR_TOKEN` hooks
        }
      };
    },
    deps: {},
  }),
];
