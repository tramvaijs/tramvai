import { test } from './request-metrics.fixture';

test.describe('Papi metrics', () => {
  test('Should collect', async ({ app }) => {
    await app.papi.publicPapi('bundleInfo').expect(200);

    const metricsResponse = await (await fetch(`${app.serverUrl}/metrics`)).text();

    test
      .expect(metricsResponse)
      .toContain(
        'papi_requests_total{method="GET",path="/metrics/papi/bundleInfo",status="200"} 1'
      );

    test
      .expect(metricsResponse)
      .toContain(
        'papi_requests_execution_time_count{method="GET",path="/metrics/papi/bundleInfo",status="200"}'
      );

    test
      .expect(metricsResponse)
      .toContain(
        'papi_requests_execution_time_sum{method="GET",path="/metrics/papi/bundleInfo",status="200"}'
      );

    test
      .expect(metricsResponse)
      .toContain(
        'papi_requests_execution_time_bucket{le="1",method="GET",path="/metrics/papi/bundleInfo",status="200"}'
      );
  });
});
