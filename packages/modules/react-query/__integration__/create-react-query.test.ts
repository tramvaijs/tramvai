import { sleep } from '@tramvai/test-integration';
import { testApp } from '@tramvai/internal-test-utils/testApp';
import { testAppInBrowser } from '@tramvai/internal-test-utils/browser';

const { getApp } = testApp(
  {
    name: 'react-query',
  },
  {
    rootDir: __dirname,
  }
);
const { getPageWrapper } = testAppInBrowser(getApp);

describe('create queries', () => {
  it('createQuery multiple prefetch - one is cached from server, another one executes on client', async () => {
    const { page } = await getPageWrapper('/use-query-multiple-prefetch/');

    {
      const delayedQueryResult = await page.getByTestId('delayed').innerHTML();
      const normalQueryResult = await page.getByTestId('normal').innerHTML();

      expect(delayedQueryResult).toBe('loading');
      expect(normalQueryResult).toBe('Hello, Mock!');
    }

    await page.waitForFunction(
      () => {
        return document.querySelector('[data-testid="delayed"]')?.innerHTML !== 'loading';
      },
      {
        timeout: 5000,
      }
    );

    {
      const delayedQueryResult = await page.getByTestId('delayed').innerHTML();
      const normalQueryResult = await page.getByTestId('normal').innerHTML();

      expect(delayedQueryResult).toBe('Hello, Mock!');
      expect(normalQueryResult).toBe('Hello, Mock!');
    }
  });

  it('createInfiniteQuery multiple prefetch - one is cached from server, another one executes on client', async () => {
    const ENTITIES_PER_PAGE_IN_MOCK = 30;

    const { page } = await getPageWrapper('/use-infinite-query-multiple-prefetch/');

    const getQueryStatusByTestId = (testId: string) =>
      page.getByTestId(testId).getAttribute('data-status');

    const getEntitiesLengthByTestId = (testId: string) =>
      page.getByTestId(testId).getAttribute('data-length');

    {
      const delayedQueryLoadingStatus = await getQueryStatusByTestId('delayed');
      const normalQueryLoadingStatus = await getQueryStatusByTestId('normal');
      expect(delayedQueryLoadingStatus).toBe('loading');
      expect(normalQueryLoadingStatus).toBe('finished');

      const delayedQueryEntitiesLength = await getEntitiesLengthByTestId('delayed');
      const normalQueryEntitiesLength = await getEntitiesLengthByTestId('normal');
      expect(delayedQueryEntitiesLength).toBe('-1');
      expect(normalQueryEntitiesLength).toBe(`${ENTITIES_PER_PAGE_IN_MOCK}`);
    }

    await page.waitForFunction(
      () => {
        return (
          document.querySelector('[data-testid="delayed"]')?.getAttribute('data-status') !==
          'loading'
        );
      },
      {
        timeout: 5000,
      }
    );

    {
      const delayedQueryLoadingStatus = await getQueryStatusByTestId('delayed');
      const normalQueryLoadingStatus = await getQueryStatusByTestId('normal');
      expect(delayedQueryLoadingStatus).toBe('finished');
      expect(normalQueryLoadingStatus).toBe('finished');

      const delayedQueryEntitiesLength = await getEntitiesLengthByTestId('delayed');
      const normalQueryEntitiesLength = await getEntitiesLengthByTestId('normal');
      expect(delayedQueryEntitiesLength).toBe(`${ENTITIES_PER_PAGE_IN_MOCK}`);
      expect(normalQueryEntitiesLength).toBe(`${ENTITIES_PER_PAGE_IN_MOCK}`);
    }

    // Load second page for normal
    await page.getByTestId('delayed').getByText('More').click();

    {
      const delayedQueryLoadingStatus = await getQueryStatusByTestId('delayed');
      const normalQueryLoadingStatus = await getQueryStatusByTestId('normal');
      expect(delayedQueryLoadingStatus).toBe('finished');
      expect(normalQueryLoadingStatus).toBe('finished');

      const delayedQueryEntitiesLength = await getEntitiesLengthByTestId('delayed');
      const normalQueryEntitiesLength = await getEntitiesLengthByTestId('normal');
      expect(delayedQueryEntitiesLength).toBe('30');
      expect(normalQueryEntitiesLength).toBe(`${ENTITIES_PER_PAGE_IN_MOCK}`);
    }

    // wait till loads more
    await sleep(1000);
    await page.waitForFunction(
      () => document.querySelector('[data-testid="delayed"]')?.getAttribute('data-length') === '60'
    );

    {
      const delayedQueryLoadingStatus = await getQueryStatusByTestId('delayed');
      const normalQueryLoadingStatus = await getQueryStatusByTestId('normal');
      expect(delayedQueryLoadingStatus).toBe('finished');
      expect(normalQueryLoadingStatus).toBe('finished');

      const delayedQueryEntitiesLength = await getEntitiesLengthByTestId('delayed');
      const normalQueryEntitiesLength = await getEntitiesLengthByTestId('normal');
      expect(delayedQueryEntitiesLength).toBe(`${2 * ENTITIES_PER_PAGE_IN_MOCK}`);
      expect(normalQueryEntitiesLength).toBe(`${ENTITIES_PER_PAGE_IN_MOCK}`);
    }
  });
});
