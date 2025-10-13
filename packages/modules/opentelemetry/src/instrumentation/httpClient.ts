import { provide } from '@tramvai/core';
import { DEFAULT_HTTP_CLIENT_INTERCEPTORS } from '@tramvai/tokens-http-client';
import { METRICS_SERVICES_REGISTRY_TOKEN } from '@tramvai/tokens-metrics';
import type { Span } from '@opentelemetry/api';
import { SpanKind } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_SERVER_ADDRESS,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions';
import { OPENTELEMETRY_TRACER_TOKEN } from '../tokens';

export const providers = [
  provide({
    provide: DEFAULT_HTTP_CLIENT_INTERCEPTORS,
    useFactory: ({ tracer, metricsServicesRegistry }) => {
      return (request, next) => {
        const url =
          request.url ??
          // todo add leading slash before path if needed
          (request.baseUrl ? `${request.baseUrl}${request.path}` : (request.path ?? ''));
        const parsedUrl = new URL(
          request.query ? `${url}?${new URLSearchParams(request.query).toString()}` : url
        );
        const serviceName = metricsServicesRegistry.getServiceName(url, request) ?? 'unknown';
        const method = request.method ?? 'GET';

        const { traceparent, tracestate } = tracer.propagateContext();

        if (traceparent !== undefined) {
          if (!request.headers) {
            request.headers = {};
          }

          request.headers.traceparent = traceparent;
        }

        if (tracestate !== undefined) {
          if (!request.headers) {
            request.headers = {};
          }

          request.headers.tracestate = tracestate;
        }

        // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#http-client
        return tracer.trace(`${method} ${serviceName}`, { kind: SpanKind.CLIENT }, (span) => {
          // todo: move custom tramvai attrs to constants
          span.setAttribute('tramvai.scope', 'http-client');
          span.setAttribute('tramvai.http-client.transport', 'undici');

          span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method);
          span.setAttribute(ATTR_SERVER_ADDRESS, parsedUrl.hostname);
          span.setAttribute(ATTR_URL_PATH, parsedUrl.pathname);
          span.setAttribute(ATTR_URL_QUERY, parsedUrl.search.replace('?', ''));
          span.setAttribute(ATTR_URL_SCHEME, parsedUrl.protocol.replace(':', ''));
          span.setAttribute(ATTR_URL_FULL, parsedUrl.href);
          // todo req/res headers?
          // todo http.request.resend_count?

          return next(request)
            .then((response) => {
              span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);

              const meta = (response as any).__meta;
              if (meta) {
                writeMetaAttributes(span, meta);
              }

              return response;
            })
            .catch((error) => {
              span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, error?.status ?? 500);

              const meta = (error as any).__meta;
              if (meta) {
                writeMetaAttributes(span, meta);
              }

              throw error;
            });
        });
      };
    },
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
      metricsServicesRegistry: METRICS_SERVICES_REGISTRY_TOKEN,
    },
  }),
];

function writeMetaAttributes(span: Span, meta: Record<string, any>) {
  const { cache, CIRCUIT_BREAKER } = meta;

  if (cache) {
    span.setAttribute('tramvai.http-client.cache.forced', cache.forced);
    span.setAttribute('tramvai.http-client.cache.enabled', cache.enabled);
    span.setAttribute('tramvai.http-client.cache.enabled', cache.enabled);
    span.setAttribute('tramvai.http-client.cache.memory.enabled', cache.memoryEnabled);
    span.setAttribute('tramvai.http-client.cache.memory.force', cache.memoryForce);
    span.setAttribute('tramvai.http-client.cache.memory.cache', cache.memoryCache);
    span.setAttribute('tramvai.http-client.cache.memory.cache.outdated', cache.memoryCacheOutdated);
    span.setAttribute('tramvai.http-client.cache.deduplicate.enabled', cache.deduplicateEnabled);
    span.setAttribute('tramvai.http-client.cache.deduplicate.force', cache.deduplicateForce);
  }

  if (CIRCUIT_BREAKER) {
    span.setAttribute('tramvai.http-client.circuit-breaker.open', CIRCUIT_BREAKER?.open);
  }
}
