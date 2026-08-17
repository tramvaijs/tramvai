import type { TestFixture } from '@playwright/test';
import { test as base } from '@playwright/test';
import sharedEnv from '@tramvai/internal-test-utils/env';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { BuildAppTypes } from '@tramvai/test-pw';
import { buildAppFixture, appServerFixture } from '@tramvai/test-pw';
import httpProxy from 'http-proxy';

type FallbackCdn = {
  port: number;
  /** urls requested from the fallback CDN, allows to assert that a retry really happened */
  requests: string[];
};

type AppFixtures = {
  appServer: BuildAppTypes.AppServer;
  fallbackCdn: FallbackCdn;
};

type WorkerFixture = {
  appTarget: BuildAppTypes.AppTarget;
  buildOptions: BuildAppTypes.BuildOptions;
  buildApp: void;
  appServerOptions: BuildAppTypes.AppServerOptions;
  fallbackCdnOptions: { port: number };
};

/**
 * Fallback CDN - a proxy to the same static server of the application.
 * Used as a retry target, so a retry to another host can be tested:
 * assets are available there, but on a different port.
 *
 * `auto: true` - the proxy must start for every test in this file, even if the test
 * does not destructure `fallbackCdn`. Otherwise a retry would fail with a connection
 * error instead of hitting the fallback host, and tests asserting the absence of a
 * retry request would pass vacuously.
 */
const fallbackCdnFixture: [
  TestFixture<
    FallbackCdn,
    { fallbackCdnOptions: { port: number }; appServer: BuildAppTypes.AppServer }
  >,
  { scope: 'test'; auto: true },
] = [
  async ({ fallbackCdnOptions, appServer }, use) => {
    const requests: string[] = [];

    const proxy = httpProxy.createProxyServer({
      target: {
        host: 'localhost',
        port: appServer.staticPort,
      },
    });

    proxy.on('proxyReq', (_proxyReq, req) => {
      if (req.url) {
        requests.push(req.url);
      }
    });

    proxy.listen(fallbackCdnOptions.port);

    await use({ port: fallbackCdnOptions.port, requests });

    // wait for the port to be released, otherwise the next test in the same worker
    // fails with EADDRINUSE
    await new Promise<void>((resolve) => {
      proxy.close(() => resolve());
    });
  },
  { scope: 'test', auto: true },
];

const defaultEnv = { ...sharedEnv };
delete defaultEnv.NODE_ENV;
delete defaultEnv.ASSETS_PREFIX;

export const test = base.extend<AppFixtures, WorkerFixture>({
  appTarget: [
    {
      name: 'retry-assets',
      cwd: __dirname,
    },
    { scope: 'worker', auto: true },
  ],
  buildApp: buildAppFixture,
  buildOptions: [{}, { scope: 'worker', auto: true, option: true }],
  appServer: appServerFixture,
  appServerOptions: [
    async ({ fallbackCdnOptions }, use) => {
      await use({
        env: {
          ...defaultEnv,
          // retry to a different host (the fallback CDN proxy)
          FALLBACK_CDN_PORT: String(fallbackCdnOptions.port),
        },
      });
    },
    { scope: 'worker', auto: true, option: true },
  ],
  fallbackCdn: fallbackCdnFixture,
  fallbackCdnOptions: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const port = await getPort();

      await use({ port });
    },
    { scope: 'worker', auto: true, option: true },
  ],
});
