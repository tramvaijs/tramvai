import { sleep } from '@tramvai/test-integration';
import { test } from './test.fixture';

test.describe('tramvai/cache-warmup', async () => {
  test('cache warmup should resolve extra routes from "prerender:routes" hook and support skipped requests in "cache-warmup:request" hook', async ({
    appServer,
  }) => {
    // waiting for cache warmup to finish
    await sleep(1000);

    test
      .expect(
        appServer.stdout
          .filter((line) => line.includes('cache-warmup') && line.includes('URLs'))
          .map((line) => {
            return JSON.parse(line).message.replaceAll(`http://localhost:${appServer.port}/`, '/');
          })
      )
      .toEqual([
        `Cache warmup URLs:
/
/second/
/1/test/1/
/2/test/2/
/3/test/3/`,
        `Cache warmup process 'SUCCESS', skipped URLs:
/second/
/second/
/3/test/3/
/3/test/3/`,
        'Cache warmup made 6 requests for 5 URLs',
      ]);
  });
});
