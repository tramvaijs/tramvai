import { test } from './request-metrics.fixture';

test.describe('Request metrics', () => {
  test('Should collect', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl);
    await page.waitForLoadState('networkidle');

    const metricsResponse = await (await fetch(`${app.serverUrl}/metrics`)).text();

    test.expect(metricsResponse).toContain('tcp_connect_duration_bucket{le="1",service="');
    test.expect(metricsResponse).toContain('tcp_connect_duration_count{service="');
    test.expect(metricsResponse).toContain('tcp_connect_duration_sum{service="');

    test
      .expect(metricsResponse)
      .toContain('dns_resolve_duration_bucket{le="1",service="localhost"}');
    test.expect(metricsResponse).toContain('dns_resolve_duration_count{service="localhost"}');
    test.expect(metricsResponse).toContain('dns_resolve_duration_sum{service="localhost"}');

    test
      .expect(metricsResponse)
      .toContain('http_sent_requests_duration_bucket{le="1",method="GET",service="');
    test
      .expect(metricsResponse)
      .toContain(
        'http_sent_requests_duration_count{method="GET",service="RESOURCE_INLINER",status="200"}'
      );
    test
      .expect(metricsResponse)
      .toContain(
        'http_sent_requests_duration_sum{method="GET",service="RESOURCE_INLINER",status="200"}'
      );

    test
      .expect(metricsResponse)
      .toContain('http_sent_requests_errors{method="GET",service="http://not-exists.com"');

    // plain http request
    test
      .expect(metricsResponse)
      .toContain(
        'http_sent_requests_duration_bucket{le="1",method="unknown",service="HTTP_REQUEST",status="ENOTFOUND"} 1'
      );

    // plain fetch request
    test
      .expect(metricsResponse)
      .toContain(
        'http_sent_requests_duration_bucket{le="1",method="GET",service="FETCH_REQUEST",status="unknown"} 1'
      );

    // httpClient + plain fetch + plain http
    test
      .expect(metricsResponse)
      .toContain('dns_resolve_duration_bucket{le="1",service="not-exists.com"} 3');
  });
});
