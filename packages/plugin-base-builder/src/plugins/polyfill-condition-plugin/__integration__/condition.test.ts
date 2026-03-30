import fs from 'node:fs';
import { fastify } from 'fastify';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import { initPlaywright } from '@tramvai/test-pw';
import { getMaxBrowserVersionsByFeatures, getPolyfillCondition } from '../polyfillCondition';
import { getSpecToFeatureDict } from '../specToFeature';

const polyfillEntryPath = require.resolve('@tinkoff/pack-polyfills');
const polyfillsEntryContent = fs.readFileSync(polyfillEntryPath, 'utf-8');

// import 'core-js/modules/es.array.at'; => 'es.array.at'
const usedFeatures = [...polyfillsEntryContent.matchAll(/core-js\/modules\/(.*)'/gm)].map(
  (item) => item[1]
);

jest.setTimeout(3 * 60 * 1000);

describe('polyfills', () => {
  let server;
  let port;
  let testUrl;

  beforeAll(async () => {
    server = fastify();
    port = await getPort();
    testUrl = `http://localhost:${port}`;

    server.get('*', () => '<html></html>');
    server.listen({ port });
  });

  afterAll(() => {
    server.close();
  });

  describe('spec to feature generator', () => {
    it('should generate feature: expression dictionary', () => {
      const specToFeatureDict = getSpecToFeatureDict();

      expect(specToFeatureDict).toMatchSnapshot('featureDict');
    });

    it('all feature expresssion should be valid', async () => {
      const specToFeatureDict = getSpecToFeatureDict();
      const { getPageWrapper, browser } = await initPlaywright(testUrl);

      const { page } = await getPageWrapper(testUrl);

      const specExpressionsResult = await page.evaluate(
        ([specDict]) => {
          const evalResult: Record<string, string> = {};

          for (const featureName in specDict) {
            const expression = specDict[featureName];
            try {
              // eslint-disable-next-line no-eval
              const result = eval(`Boolean(${expression})`);
              evalResult[featureName] = result;
            } catch (err) {
              evalResult[featureName] = '';
            }
          }

          return evalResult;
        },
        [specToFeatureDict]
      );

      expect(specExpressionsResult).toMatchSnapshot('expressionsResult');

      const failedSpecExpressions = [];

      // Неподдерживаемые в браузерах спецификации
      const ignoredSpecs = [
        'es.async-disposable-stack',
        'es.disposable-stack',
        'es.suppressed-error',
        'es.web.immediate',
        'web.immediate',
        'es.observable',
      ];

      // Проверяем что не прошли проверку только esnext фичи и несколько исключений
      for (const specName in specExpressionsResult) {
        const specResult = specExpressionsResult[specName];

        if (!specResult && !specName.includes('esnext') && !ignoredSpecs.includes(specName)) {
          failedSpecExpressions.push(`${specName} - ${specToFeatureDict[specName]}`);
        }
      }

      expect(failedSpecExpressions.length).toBe(0);

      await browser.close();
    });
  });

  describe('polyfill condition', () => {
    it('should generate max browser versions dict', () => {
      const browserVersions = getMaxBrowserVersionsByFeatures(usedFeatures);

      expect(browserVersions).toMatchSnapshot('browserVersions');
    });

    it('should generate valid polyfill condition', async () => {
      const browserVersions = getMaxBrowserVersionsByFeatures(usedFeatures);
      const polyfillCondition = getPolyfillCondition(browserVersions);

      expect(polyfillCondition).toMatchSnapshot('polyfillCondition');

      const { getPageWrapper, browser } = await initPlaywright(testUrl);

      const { page } = await getPageWrapper(testUrl);

      const polyfillConditionResult = await page.evaluate(
        ([expression]) => {
          // eslint-disable-next-line no-eval
          return eval(expression);
        },
        [polyfillCondition]
      );

      expect(polyfillConditionResult).toBe(false);

      browser.close();
    });
  });
});
