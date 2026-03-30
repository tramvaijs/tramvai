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
});
