import type { Page } from '@playwright/test';
import { testApp } from '@tramvai/internal-test-utils/testApp';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';

const utilityServerPort = 3003;
describe('modules/metrics/standalone', () => {
  let page: Page;

  const { getApp } = testApp(
    {
      name: 'metrics',
    },
    {
      env: {
        UTILITY_SERVER_PORT: String(utilityServerPort),
      },
    }
  );
  const { getBrowser } = testAppInBrowser(getApp);

  beforeEach(async () => {
    page = await getBrowser().newPage();
  });

  it('Metrics server is running on standalone server', async () => {
    const app = getApp();
    await page.goto(`${app.serverUrl}/`, { waitUntil: 'networkidle' });

    expect((await fetch(`${getApp().serverUrl}/metrics`)).status).toBe(404);
    expect((await fetch(`${getApp().utilityUrl}/metrics`)).status).toBe(200);
  });
});
