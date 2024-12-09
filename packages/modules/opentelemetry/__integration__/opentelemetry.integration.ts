import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';
import { test } from './opentelemetry-test-fixture';

const idGenerator = new RandomIdGenerator();

test.describe('packages/modules/opentelemetry', () => {
  test.describe('opentelemetry', () => {
    test.beforeEach(async ({ app }) => {
      await app.papi.publicPapi('trace-exporter-clear').expect(200);
    });

    test('should create request span and custom child span', async ({ app }) => {
      await app.request(`/test/`);

      const tracesResponse = await app.papi.publicPapi('trace-exporter-get').expect(200);
      const traces: Array<Record<string, any>> = JSON.parse(
        JSON.parse(tracesResponse.text).payload
      );
      const rootSpan = traces.find((trace) => trace.name === 'GET APP')!;
      const customSpan = traces.find((trace) => trace.name === 'customerStart')!;

      test.expect(rootSpan).not.toBeUndefined();
      test.expect(rootSpan.attributes['url.path']).toBe('/test/');
      test.expect(rootSpan.attributes['http.response.status_code']).toBe(200);
      test.expect(customSpan.parentId).toBe(undefined);

      test.expect(customSpan.name).toBe('customerStart');
      test.expect(customSpan.parentId).toBe(rootSpan.spanId);

      test.expect(customSpan.traceId).toBe(rootSpan.traceId);
    });

    test('should propagate incoming request traceparent header', async ({ app }) => {
      const incomingTraceId = idGenerator.generateTraceId();
      const incomingSpanId = idGenerator.generateSpanId();

      await app.request(`/test/`, {
        // https://www.w3.org/TR/trace-context/#traceparent-header
        headers: { traceparent: `00-${incomingTraceId}-${incomingSpanId}-01` },
      });

      const tracesResponse = await app.papi.publicPapi('trace-exporter-get').expect(200);
      const traces: Array<Record<string, any>> = JSON.parse(
        JSON.parse(tracesResponse.text).payload
      );

      const rootSpan = traces.find((trace) => trace.name === 'GET APP')!;

      test.expect(rootSpan).not.toBeUndefined();
      test.expect(rootSpan.parentSpanId).toBe(incomingSpanId);
    });

    // todo http-client instrumentation

    // todo logs correlation
  });
});
