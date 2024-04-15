import { test } from './micro-sentry-test-fixture';

const errorHubAPIURL = 'https://error-hub.tinkoff.ru/api/1/store/';

interface Response {
  ok: boolean;
  errorMessage: string;
}

test.describe('packages/modules/micro-sentry', () => {
  let errorFromQueueResponse: { json: () => Promise<Response> };
  test.describe('micro-sentry', () => {
    test.beforeEach(async ({ page, I, app }) => {
      await page.route(errorHubAPIURL, (route) => {
        const request = route.request();
        if (request.url().startsWith(errorHubAPIURL)) {
          const json = request.postDataJSON() as {
            exception: { values: any };
            tags: {
              'app.name': string;
              'app.platform': string;
              wuid: string;
            };
            user: {
              wuid: string;
              ip_address: string;
            };
          };
          const errorMessage = json?.exception?.values[0]?.value;

          route.fulfill({
            status: 200,
            json: {
              ok: true,
              errorMessage,
            },
          });
        }
      });
      await I.gotoPage(`${app.serverUrl}/test`);

      const errorFromQueue = page.waitForResponse(errorHubAPIURL);
      errorFromQueueResponse = await errorFromQueue;
    });
    test('should send unhandledrejection error to ErrorHub', async ({ app, page, I }) => {
      const responsePromise = page.waitForResponse(errorHubAPIURL);

      await page.getByRole('button', { name: 'Trigger Unhandle Promise Rejection Error' }).click();
      const response = await responsePromise;
      const json = (await response.json()) as Response;
      test.expect(json.errorMessage).toBe('Unhandled Promise Rejection error');
    });

    test('should send unhandled error to ErrorHub', async ({ app, page, I }) => {
      const responsePromise = page.waitForResponse(errorHubAPIURL);

      await page.getByRole('button', { name: 'Trigger unhandled error' }).click();
      const response = await responsePromise;
      const json = (await response.json()) as Response;
      test.expect(json.errorMessage).toBe('Unhandled error');
    });

    test('should send explicitly triggered report to ErrorHub', async ({ app, page, I }) => {
      const errorResponse = page.waitForResponse(errorHubAPIURL);

      await page.getByRole('button', { name: 'Send sample error to ErrorHub' }).click();
      const error = await errorResponse;
      const json = (await error.json()) as Response;
      test
        .expect(json.errorMessage)
        .toBe('Sample error message from tinkoff-examples/tincoin application');
    });

    test('Should clear errorsQueue after micro-sentry initialization', async ({ app, page, I }) => {
      const response = (await (await errorFromQueueResponse).json()) as Response;
      test.expect(response.errorMessage).toBe('this error was thrown before micro-sentry loaded');

      const errorInterceptor: { errorsQueue: Error[] } = await page.evaluate(() => {
        //@ts-expect-error
        return window.__MICRO_SENTRY_MODULE_INLINE_ERROR_INTERCEPTOR__;
      });
      test.expect(errorInterceptor.errorsQueue).toHaveLength(0);
    });
  });
});
