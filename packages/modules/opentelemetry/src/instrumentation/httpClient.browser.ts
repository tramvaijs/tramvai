import { provide } from '@tramvai/core';
import { DEFAULT_HTTP_CLIENT_INTERCEPTORS } from '@tramvai/tokens-http-client';
import { getUrlFromRequest } from '@tramvai/module-http-client';
import {
  OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN,
  OPENTELEMETRY_TRACER_TOKEN,
} from '../tokens';

export const providers = [
  provide({
    provide: DEFAULT_HTTP_CLIENT_INTERCEPTORS,
    useFactory: ({ tracer, includeHeaders }) => {
      return (request, next) => {
        // avoid wrapping the request if the traceparent header has already been passed
        if (request.headers?.traceparent) {
          return next(request);
        }

        if (includeHeaders && !includeHeaders(getUrlFromRequest(request))) {
          return next(request);
        }

        const method = request.method ?? 'GET';
        const serviceName = request.baseUrlEnv ?? 'unknown';

        return tracer.trace(`${method} ${serviceName}`, (span) => {
          if (!request.headers) {
            request.headers = {};
          }

          // TODO: Enrich the span with the same attributes as the server tracer once the client SDK is integrated
          const { traceId, spanId } = span.spanContext();
          request.headers.traceparent = `00-${traceId}-${spanId}-01`;

          return next(request);
        });
      };
    },
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
      includeHeaders: {
        token: OPENTELEMETRY_HTTP_CLIENT_BROWSER_HEADERS_INCLUDE_TOKEN,
        optional: true,
      },
    },
  }),
];
