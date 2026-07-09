/* eslint-disable max-nested-callbacks */
import { test } from './test-fixture';

test.describe('tinkoff-examples/simple-app-pwa/monitoring', () => {
  test.describe('Запуск проекта с ошибками', () => {
    test('Корректные события для мониторинга отправляются при ошибках во время старта проекта', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple-with-error/`);
      await test.step('Ожидаем событие assets-load-failed после возникновения ошибки при загрузке критичных ресурсов', async () => {
        await page.waitForFunction(() => {
          return (window as any)['assets-load-failed'] === true;
        });
        await page.waitForFunction(() => {
          return !(window as any)['assets-loaded'];
        });
      });
    });
    test('Корректные события для мониторинга во время возникновения критичных ошибок', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple-with-fail-token`);
      await page.evaluate(() => {
        const error = new Error('Error event with error');
        window.dispatchEvent(new ErrorEvent('error', { error }));
      });
      await page.waitForFunction(() => {
        return (window as any).appInitFailed === true;
      });
    });
    test('Корректные события для мониторинга во время возникновения не обработанных ошибок', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple-with-fail-token`);
      await page.evaluate(() => {
        const promiseError = new Error('Unhandled error example');
        Promise.reject(promiseError);
      });
      await page.waitForFunction(() => {
        return (window as any)?.['unhandled-error'] === true;
      });
      await I.refreshPage();
      await page.evaluate(() => {
        const promiseError = new Error('Unhandled error example with error');
        Promise.reject(promiseError);
      });
      await page.waitForFunction(() => {
        return (window as any)?.appInitFailed === true;
      });
    });
    test('Корректные события для мониторинга во время возникновения ошибок гидрации', async ({
      I,
      page,
      app,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple?error=true`);
      await page.waitForFunction(() => {
        return (window as any).errorBoundary === true;
      });
      await page.waitForFunction(() => {
        return (window as any).appRenderFailed === true && !(window as any)?.appRendered;
      });
    });
  });
  test.describe('Успешный запуск проекта', () => {
    test('Корректные события для мониторинга отправляются при успешном запуске проекта', async ({
      page,
      app,
      I,
      App,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple/`);

      await test.step('Дожидаемся события html-opened', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['html-opened'] === true;
        });
      });

      await test.step('Дожидаемся события assets-loaded', async () => {
        await page.waitForFunction(() => {
          return (window as any)?.['assets-loaded'] === true;
        });
      });

      await test.step('Дожидаемся события app-initialized', async () => {
        await page.waitForFunction(() => {
          return (window as any).appInit === true;
        });
      });

      await test.step('Дожидаемся события полного рендера приложения', async () => {
        await page.waitForFunction(() => {
          return (window as any).appRendered === true;
        });
      });
    });
  });
  test.describe('SSR blocking render mode', () => {
    test('Успешный SSR рендер - вызваны react:render и app:rendered хуки', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/simple/`);

      const events = await page.evaluate(
        () => (window as any).contextExternal.getState().ssrHooksStore.events
      );

      await test.step('Хук react:render вызван', async () => {
        test.expect(events).toContain('react:render');
      });

      await test.step('Хук app:rendered вызван', async () => {
        test.expect(events).toContain('app:rendered');
      });

      await test.step('Хук app:render-failed не вызван', async () => {
        test.expect(events).not.toContain('app:render-failed');
      });

      await test.step('Хуки react:error не вызваны', async () => {
        test.expect(events.filter((e: string) => e.startsWith('react:error'))).toHaveLength(0);
      });
    });

    test('SSR фатальная ошибка (onShellError) - сервер возвращает 500, вызваны react:error и app:render-failed хуки', async ({
      page,
      app,
    }) => {
      const response = await page.request.fetch(`${app.serverUrl}/ssr-error/`);
      test.expect(response.status()).toBe(500);

      const hooksHeader = response.headers()['x-ssr-hooks'] ?? '';
      const events = hooksHeader.split(',').filter(Boolean);

      await test.step('Хук react:error:ssr:on-shell-error вызван', async () => {
        test.expect(events).toContain('react:error:ssr:on-shell-error');
      });

      await test.step('Хук app:render-failed вызван', async () => {
        test.expect(events).toContain('app:render-failed');
      });

      await test.step('Хук app:rendered не вызван', async () => {
        test.expect(events).not.toContain('app:rendered');
      });
    });

    test('SSR восстанавливаемая ошибка (onError внутри Suspense) - вызваны react:error и app:rendered хуки', async ({
      page,
      app,
      I,
    }) => {
      await I.gotoPage(`${app.serverUrl}/ssr-recoverable-error/`);

      const events = await page.evaluate(
        () => (window as any).contextExternal.getState().ssrHooksStore.events
      );

      await test.step('Хук react:error:ssr:on-error вызван для восстанавливаемой ошибки', async () => {
        test.expect(events).toContain('react:error:ssr:on-error');
      });

      await test.step('Хук react:render вызван - shell отрендерился успешно', async () => {
        test.expect(events).toContain('react:render');
      });

      await test.step('Хук app:rendered вызван - восстанавливаемая ошибка не блокирует рендер', async () => {
        test.expect(events).toContain('app:rendered');
      });

      await test.step('Хук app:render-failed не вызван - ошибка внутри Suspense не фатальная', async () => {
        test.expect(events).not.toContain('app:render-failed');
      });

      await test.step('Fallback отрендерился вместо компонента с ошибкой', async () => {
        const shellText = await page.textContent('#ssr-recoverable-ok');
        test.expect(shellText).toBe('Page shell rendered');
      });
    });
  });
});
