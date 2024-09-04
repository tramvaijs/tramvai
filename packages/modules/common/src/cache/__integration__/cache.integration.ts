import { test } from './fixtures';
import { CACHE_NAME_LFU, CACHE_NAME_LRU } from './tokens';

test.describe('cache metrics integration', () => {
  test.beforeEach(async ({ I, app }) => {
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/clear/`);
  });

  test('should set max gauge', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step('Проверяем что в метриках тестового кэша есть max', async () => {
      await test
        .expect(page.locator('body'))
        .toContainText(`cache_max{name="${CACHE_NAME_LRU}"} 5`);
    });
  });

  test('should set max gauge on default cache size', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step(
      'Проверяем что в метриках тестового кэша с дефолтным размером есть max',
      async () => {
        await test
          .expect(page.locator('body'))
          .toContainText(`cache_max{name="${CACHE_NAME_LFU}"} 100`);
      }
    );
  });

  test('should set size gauge', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/set/?key=value`);
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step('Проверяем что в метриках тестового кэша size', async () => {
      await test
        .expect(page.locator('body'))
        .toContainText(`cache_size{name="${CACHE_NAME_LRU}"} 1`);
    });
  });

  test('should increment miss counter for get method', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/get/?key`);
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step(
      'Проверяем что в метриках get метода тестового кэша есть cache miss',
      async () => {
        await test
          .expect(page.locator('body'))
          .toContainText(`cache_miss{name="${CACHE_NAME_LRU}",method="get"} 1`);
      }
    );
  });

  test('should increment hit counter for get method', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/set/?key=value`);
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/get/?key`);
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step(
      'Проверяем что в метриках get метода тестового кэша есть cache hit',
      async () => {
        await test
          .expect(page.locator('body'))
          .toContainText(`cache_hit{name="${CACHE_NAME_LRU}",method="get"} 1`);
      }
    );
  });

  test('should increment miss counter for has method', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/has/?key`);
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step(
      'Проверяем что в метриках has метода тестового кэша есть cache miss',
      async () => {
        await test
          .expect(page.locator('body'))
          .toContainText(`cache_miss{name="${CACHE_NAME_LRU}",method="has"} 1`);
      }
    );
  });

  test('should increment hit counter for has method', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/set/?key=value`);
    await I.gotoPage(app.serverUrl, `/${CACHE_NAME_LRU}/has/?key`);
    await I.gotoPage(app.serverUrl, '/metrics');

    await test.step(
      'Проверяем что в метриках has метода тестового кэша есть cache miss',
      async () => {
        await test
          .expect(page.locator('body'))
          .toContainText(`cache_hit{name="${CACHE_NAME_LRU}",method="has"} 1`);
      }
    );
  });
});

test.describe('browser cache', () => {
  test('should provide browser implementations of cache', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/browser-cache/`);

    await test.step(
      'Проверяем что кэши отработали и на странице выводится значения из кэшей',
      async () => {
        await test.expect(page.getByTestId('text-cache')).toContainText('hello world');
      }
    );
  });

  test('should clear all browser caches', async ({ I, page, app }) => {
    await I.gotoPage(app.serverUrl, `/browser-cache/`);

    await test.step('Сбрасываем значение кэшей', async () => {
      await page.getByTestId('clear-cache').click();
    });

    await test.step('Проверяем что значение кэшей сброшены', async () => {
      await test.expect(page.getByTestId('text-cache')).toContainText('cache cleared');
    });
  });
});
