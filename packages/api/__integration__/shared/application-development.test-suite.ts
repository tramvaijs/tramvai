/* eslint-disable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */

import path from 'node:path';
import fs from 'node:fs';
import { ApplicationProject } from '@tramvai/api/lib/config';
import { test } from './test.fixture';

const sleep = (ms: number) => {
  return new Promise((resolve) => (setTimeout(resolve, ms) as unknown as NodeJS.Timeout).unref());
};

export function createTestSuite({ key, plugins }: { key: string; plugins: string[] }) {
  const testSuiteFolder = path.resolve(__dirname, '..', key);
  const fixturesFolder = path.resolve(__dirname, '..', 'fixtures');
  // todo check `testSuiteFolder` folder exists

  const projects: Record<string, ApplicationProject> = {
    'app-bundle': {
      name: 'app-bundle',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
    },
    'app-output-relative': {
      name: 'app-bundle',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
      output: {
        server: 'custom/server',
        client: 'custom/client',
        static: 'custom/static',
      },
    },
    'app-virtual-module-config': {
      name: 'app-virtual-module-config',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'virtual-module-config', 'index.ts'),
    },
    'app-broken': {
      name: 'app-broken',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'broken', 'index.ts'),
    },
    'app-broken-ssr': {
      name: 'app-broken-ssr',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'broken-ssr', 'index.ts'),
    },
    'app-jsx': {
      name: 'app-jsx',
      generateDataQaTag: true,
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'jsx', 'index.ts'),
    },
    'app-css-modules': {
      name: 'app-css-modules',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'css-modules', 'index.ts'),
    },
    'app-postcss': {
      name: 'app-postcss',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'postcss'),
      entryFile: 'index.ts',
      postcss: {
        config: 'postcss.config.js',
      },
    },
    'app-postcss-fn': {
      name: 'app-postcss-fn',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'postcss-fn'),
      entryFile: 'index.ts',
      postcss: {
        config: 'postcss.config.js',
      },
    },
    'app-fs-routing': {
      name: 'app-fs-routing',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'fs-routing'),
      entryFile: 'index.ts',
    },
    'app-config-to-env': {
      name: 'app-config-to-env',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'config-to-env'),
      entryFile: 'index.ts',
      fileSystemPages: {
        enabled: true,
        routesDir: 'customRoutesDir',
        pagesDir: 'customPagesDir',
      },
      experiments: {
        viewTransitions: true,
        reactTransitions: true,
      },
    },
    'app-root-error-boundary': {
      name: 'app-root-error-boundary',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'root-error-boundary'),
      entryFile: 'index.ts',
      fileSystemPages: {
        rootErrorBoundaryPath: 'error.tsx',
      },
    },
    'app-browserslist': {
      name: 'app-browserslist',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'browserslist'),
      entryFile: 'index.ts',
    },
    'app-polyfills': {
      name: 'app-polyfills',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'polyfills'),
      entryFile: 'index.ts',
    },
    'app-polyfills-custom': {
      name: 'app-polyfills',
      type: 'application',
      polyfill: path.join(fixturesFolder, 'application', 'polyfills', 'polyfill.ts'),
      modernPolyfill: path.join(fixturesFolder, 'application', 'polyfills', 'modern.polyfill.ts'),
      sourceDir: path.join(fixturesFolder, 'application', 'polyfills'),
      entryFile: 'index.ts',
    },
    'app-tramvai-vendor': {
      name: 'app-tramvai-vendor',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'tramvai-vendor', 'index.ts'),
    },
    'app-granular-chunks': {
      name: 'app-granular-chunks',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'granular-chunks', 'index.ts'),
      splitChunks: {
        mode: 'granularChunks',
        frameworkChunk: false,
        granularChunksSplitNumber: 2,
        granularChunksMinSize: 1000,
      },
    },
    'app-assets': {
      name: 'app-assets',
      generateDataQaTag: true,
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'assets', 'index.ts'),
    },
    'app-externals': {
      name: 'app-externals',
      generateDataQaTag: true,
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'externals', 'index.ts'),
    },
    'app-papi': {
      name: 'app-papi',
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'papi'),
      entryFile: path.join(fixturesFolder, 'application', 'papi', 'index.ts'),
      fileSystemPapiDir: 'papi',
    },
    'app-server-inline': {
      name: 'app-server-inline',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'server-inline', 'index.ts'),
    },
    'app-pwa': {
      name: 'app-pwa',
      pwa: {
        sw: {
          scope: '/',
        },
        workbox: {
          enabled: true,
        },
        webmanifest: {
          enabled: true,
        },
      },
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'app-pwa'),
    },
    'custom-pwa': {
      name: 'custom-pwa',
      pwa: {
        sw: {
          src: './custom-sw.ts',
          scope: '/scope/',
          dest: 'custom-sw.js',
        },
        workbox: {
          enabled: true,
          include: ['react\\.([\\w\\d]+?\\.)?js$'],
        },
        webmanifest: {
          enabled: true,
          name: 'my manifest',
          short_name: 'also my manifest but short',
          // TODO: сделать проверку на генерацию hash в названии для bulid
          dest: '/manifest.webmanifest',
          theme_color: '#ffdd2d',
        },
        icon: {
          src: './images/pwa-icon.png',
          dest: 'images',
          sizes: [36, 512],
        },
      },
      type: 'application',
      sourceDir: path.join(fixturesFolder, 'application', 'app-pwa'),
    },
  };

  const [builder, transpiler] = key.split('-');

  test.describe(`@tramvai/api @builder:${builder} @transpiler:${transpiler} @type:application @mode:development`, async () => {
    test.describe('api: application start', () => {
      // MARK: SERVER
      test.describe('server', () => {
        // nested describe + use is the only way to set different options for fixtures in the same test file
        // https://github.com/microsoft/playwright/issues/27138
        test.describe('app-bundle', () => {
          test.use({
            inputParameters: {
              name: 'app-bundle',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('bundle: should bundle single server.js', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('ENTRY');
            test.expect(serverJs).toContain('DYNAMIC');
          });
        });

        test.describe('app-output-relative', () => {
          test.use({
            inputParameters: {
              name: 'app-output-relative',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('output: should respect output.server', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/custom/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('ENTRY');
          });
        });

        test.describe('app-virtual-module-config', () => {
          test.use({
            inputParameters: {
              name: 'app-virtual-module-config',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('virtual-modules: "virtual:tramvai/config" import should work', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('appConfig');
            test.expect(serverJs).toContain('dist/server');
            test.expect(serverJs).toContain('dist/client');
            test.expect(serverJs).toContain('dist/static');
          });
        });

        test.describe('app-browserslist', () => {
          test.use({
            inputParameters: {
              name: 'app-browserslist',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('virtual-modules: "virtual:tramvai/browserslist" import should work', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('Chrome >= 80');
            test.expect(serverJs).toContain('ios_saf >= 14.0');
          });
        });

        test.describe('app-broken', () => {
          test.use({
            inputParameters: {
              name: 'app-broken',
              rootDir: testSuiteFolder,
              buildType: 'server',
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          const brokenFile = path.resolve(fixturesFolder, `application`, 'broken', 'dynamic.ts');

          test.beforeEach(async () => {
            // TODO: support concurrent tests
            await fs.promises.writeFile(
              brokenFile,
              `constbar = 'DYNAMIC';
  export defaultbar;`,
              'utf-8'
            );
          });

          test.afterEach(async () => {
            await fs.promises.unlink(brokenFile);
          });

          test('compiler: should rebuild broken server.js after update', async ({ devServer }) => {
            try {
              await devServer.buildPromise;
            } catch (error) {
              // expected error
            }

            const response = await fetch(
              `http://localhost:${devServer.staticPort}/dist/server/server.js`
            );
            test.expect(response.status).toBe(404);

            await fs.promises.writeFile(
              brokenFile,
              `const bar = 'DYNAMIC';
export default bar;`,
              'utf-8'
            );

            // TODO: without sleep server.js request is stuck
            await sleep(200);

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('ENTRY');
            test.expect(serverJs).toContain('DYNAMIC');
          });
        });

        test.describe('app-broken-ssr', () => {
          test.use({
            inputParameters: {
              name: 'app-broken-ssr',
              rootDir: testSuiteFolder,
              buildType: 'server',
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          const brokenFile = path.resolve(
            fixturesFolder,
            `application`,
            'broken-ssr',
            'dynamic.ts'
          );

          test.beforeEach(async () => {
            await fs.promises.writeFile(
              brokenFile,
              `constbar = 'DYNAMIC';
export defaultbar;`,
              'utf-8'
            );
          });

          test.afterEach(async () => {
            await fs.promises.unlink(brokenFile);
          });

          test('compiler: should compile broken server.js after update', async ({ devServer }) => {
            try {
              await devServer.buildPromise;
            } catch (error) {
              // expected error
            }

            const response = await fetch(`http://localhost:${devServer.port}`);
            test.expect(response.status).toBe(500);

            await fs.promises.writeFile(
              brokenFile,
              `const bar = 'DYNAMIC';
export default bar;`,
              'utf-8'
            );

            // TODO: need to wait when rebuild and compiled server started or request fails
            await sleep(200);

            const serverHtml = await (await fetch(`http://localhost:${devServer.port}`)).text();

            test.expect(serverHtml).toContain('Hello, world!');
          });
        });

        test.describe('app-config-to-env', () => {
          test.use({
            inputParameters: {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('define: should replace constants', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('isBrowser ${false}');
            test.expect(serverJs).toContain('isServer ${true}');
          });
        });

        test.describe('app-root-error-boundary', () => {
          test.use({
            inputParameters: {
              name: 'app-root-error-boundary',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('root-error-boundary: should generate root error boundary', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('Root Error Boundary');
          });
        });

        test.describe('app-assets', () => {
          test.use({
            inputParameters: {
              name: 'app-assets',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('assets: should inline url for woff2 fonts', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('CascadiaCodePL.woff2');
          });

          test('assets: should inline svg import', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('<svg xmlns=');
            test.expect(serverJs).toContain('svg-plus-icon');
          });
        });

        test.describe('app-papi', () => {
          test.use({
            inputParameters: {
              name: 'app-papi',
              rootDir: testSuiteFolder,
              buildType: 'server',
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          const papiFile = path.resolve(fixturesFolder, `application`, 'papi', 'papi', 'pong.ts');

          test.afterEach(async () => {
            await fs.promises.unlink(papiFile);
          });

          test('file-system-papi: "virtual/file-system-papi" import should be updated after changes in "api" directory', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            let serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('hello');
            test.expect(serverJs).not.toContain('unknown');
            test.expect(serverJs).not.toContain('world');

            // MARK: NEW FILE

            // TODO: support concurrent tests
            await fs.promises.mkdir(path.dirname(papiFile), { recursive: true });
            await fs.promises.writeFile(
              papiFile,
              `import { createPapiMethod } from '@tramvai/papi';

export default createPapiMethod({
  async handler() {
    return 'unknown';
  },
});`,
              'utf-8'
            );

            await sleep(100);

            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('hello');
            test.expect(serverJs).toContain('unknown');
            test.expect(serverJs).not.toContain('world');

            // MARK: CHANGED FILE

            // TODO: support concurrent tests
            // Force update file content by overwriting it
            await fs.promises.writeFile(
              papiFile,
              `import { createPapiMethod } from '@tramvai/papi';

export default createPapiMethod({
  async handler() {
    return 'world';
  },
});`,
              'utf-8'
            );

            await sleep(100);

            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('hello');
            test.expect(serverJs).not.toContain('unknown');
            test.expect(serverJs).toContain('world');
          });
        });

        test.describe('app-server-inline', () => {
          test.use({
            inputParameters: {
              name: 'app-server-inline',
              rootDir: testSuiteFolder,
              buildType: 'server',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('server-inline: should transpile *.inline.ts files as client-side code', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('ForBrowser');
            test.expect(serverJs).toContain('this.property');
          });
        });
      });

      test.describe('pwa', () => {
        test.describe('default settings', () => {
          test.use({
            inputParameters: {
              name: 'app-pwa',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('service worker', async ({ devServer }) => {
            await devServer.buildPromise;

            const swResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/sw.js`
            );

            test.expect(swResponse.status).toBe(200);
          });
        });

        test.describe('custom settings', () => {
          test.use({
            inputParameters: {
              name: 'custom-pwa',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('service worker with custom path and include', async ({ devServer }) => {
            await devServer.buildPromise;

            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            const chunks = ['react'].map((chunkname) => {
              return statsJson.assetsByChunkName[chunkname][0];
            });

            const swResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/custom-sw.js`
            );

            test.expect(swResponse.status).toBe(200);
            const swContent = await swResponse.text();

            chunks.forEach((chunkname) => {
              test.expect(swContent.includes(chunkname)).toBe(true);
            });
          });

          test('webmanifest', async ({ devServer }) => {
            await devServer.buildPromise;

            const webmanifestResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/manifest.webmanifest`
            );
            const webmanifestContent = await webmanifestResponse.json();

            test.expect(webmanifestResponse.status).toBe(200);

            test.expect(webmanifestContent.theme_color).toBe('#ffdd2d');
            test.expect(webmanifestContent.name).toBe('my manifest');
            test.expect(webmanifestContent.short_name).toBe('also my manifest but short');
            test.expect(webmanifestContent.scope).toBe('/scope/');
          });

          test('Should generate icons', async ({ devServer }) => {
            await devServer.buildPromise;

            const webmanifestResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/manifest.webmanifest`
            );
            const webmanifestContent = await webmanifestResponse.json();

            test.expect(webmanifestContent.icons.length).toBe(2);

            for (const { src } of webmanifestContent.icons) {
              const iconSrc = src.replace('4000', devServer.staticPort);
              const iconResponse = await fetch(iconSrc);
              test.expect(iconResponse.status).toBe(200);
            }
          });
        });
      });

      // MARK: BROWSER
      test.describe('browser', () => {
        test.describe('app-bundle', () => {
          test.use({
            inputParameters: {
              name: 'app-bundle',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('bundle: should bundle platform.js and separate chunks', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const dynamicJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/dynamic.chunk.js`)
            ).text();
            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            test.expect(platformJs).toContain('ENTRY');
            test.expect(dynamicJs).toContain('DYNAMIC');
            test.expect(Object.keys(statsJson.namedChunkGroups).length).toBe(2);
          });

          test('output: should generate unique chunkLoadingGlobal', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(platformJs).toContain('chunkLoadingGlobal');
            test.expect(platformJs).toContain('webpackChunkapplication_app_bundle_0_0_0_stub');
          });
        });

        test.describe('app-tramvai-vendor', () => {
          test.use({
            inputParameters: {
              name: 'app-tramvai-vendor',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('splitChunks: should create tramvai vendor chunk', async ({ devServer }) => {
            await devServer.buildPromise;

            const tramvaiJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/tramvai.js`)
            ).text();

            test.expect(tramvaiJs).toContain('createToken');
            test.expect(tramvaiJs).toContain('createApp');
          });
        });

        test.describe('app-granular-chunks', () => {
          test.use({
            inputParameters: {
              name: 'app-granular-chunks',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('splitChunks: should create granular chunks', async ({ devServer }) => {
            await devServer.buildPromise;

            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            const chunks = statsJson.chunks.map((chunk: any) => chunk.files[0]);

            test.expect(chunks).toEqual([
              'packages_api___integration___fixtures_application_granular-chunks_pages_bar_tsx.chunk.js',
              'packages_api___integration___fixtures_application_granular-chunks_pages_baz_tsx.chunk.js',
              'packages_api___integration___fixtures_application_granular-chunks_pages_foo_tsx.chunk.js',
              'platform.js',
              'react.chunk.js',
              'shared-node_modules_tinkoff_logger_lib_index_browser_js.chunk.js',
              'shared-node_modules_tinkoff_utils_function_noop_js-node_modules_tinkoff_utils_is_object_js-no-38cf93.chunk.js',
              // chunk name depends on the builder - different for `tsc` (locally) or `@tramvai/build` (CI)
              test.expect.stringMatching('shared-packages_libs_router_lib_index_'),
            ]);
          });
        });

        ['app-polyfills', 'app-polyfills-custom'].forEach((projectName) => {
          test.describe(projectName, () => {
            test.use({
              inputParameters: {
                name: projectName,
                rootDir: testSuiteFolder,
                buildType: 'client',
                noRebuild: true,
              },
              extraConfiguration: {
                plugins,
                projects,
              },
            });

            test(`build: ${projectName} should build polyfills in separate chunks`, async ({
              devServer,
            }) => {
              await devServer.buildPromise;

              const polyfillJsResponse = await fetch(
                `http://localhost:${devServer.staticPort}/dist/client/polyfill.js`
              );
              const polyfillJs = await polyfillJsResponse.text();
              const modernPolyfillJsResponse = await fetch(
                `http://localhost:${devServer.staticPort}/dist/client/modern.polyfill.js`
              );
              const modernPolyfillJs = await modernPolyfillJsResponse.text();
              const statsJson = await (
                await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
              ).json();

              test.expect(modernPolyfillJsResponse.status).toBe(200);
              test.expect(modernPolyfillJs).toMatch('core-js/modules/web.structured-clone');
              test.expect(polyfillJsResponse.status).toBe(200);
              test.expect(polyfillJs).toContain('core-js/modules/es.promise.with-resolvers');
              test.expect(statsJson.polyfillCondition).toBeTruthy();
            });
          });
        });

        test.describe('app-output-relative', () => {
          test.use({
            inputParameters: {
              name: 'app-output-relative',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('output: should respect output.client', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/custom/client/platform.js`)
            ).text();
            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/custom/client/stats.json`)
            ).json();

            test.expect(platformJs).toContain('ENTRY');
            test.expect(Object.keys(statsJson.namedChunkGroups).length).toBe(2);
          });
        });

        test.describe('app-broken', () => {
          test.use({
            inputParameters: {
              name: 'app-broken',
              rootDir: testSuiteFolder,
              buildType: 'client',
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          const brokenFile = path.resolve(fixturesFolder, `application`, 'broken', 'dynamic.ts');

          test.beforeEach(async () => {
            await fs.promises.writeFile(
              brokenFile,
              `constbar = 'DYNAMIC';
  export defaultbar;`,
              'utf-8'
            );
          });

          test.afterEach(async () => {
            await fs.promises.unlink(brokenFile);
          });

          test('compiler: should rebuild broken client code after update', async ({
            devServer,
          }) => {
            try {
              await devServer.buildPromise;
            } catch (error) {
              // expected error
            }

            const response = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/platform.js`
            );
            test.expect(response.status).toBe(404);

            await fs.promises.writeFile(
              brokenFile,
              `const bar = 'DYNAMIC';
export default bar;`,
              'utf-8'
            );

            // TODO: without sleep server.js request is stuck
            await sleep(200);

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(platformJs).toContain('ENTRY');
          });
        });

        test.describe('app-config-to-env', () => {
          test.use({
            inputParameters: {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('define: should replace constants', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(platformJs).toContain('isBrowser ${true}');
            test.expect(platformJs).toContain('isServer ${false}');
          });
        });

        test.describe('app-root-error-boundary', () => {
          test.use({
            inputParameters: {
              name: 'app-root-error-boundary',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('root-error-boundary: should create new entry point with hydration logic', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const rootErrorBoundaryJs = await (
              await fetch(
                `http://localhost:${devServer.staticPort}/dist/client/rootErrorBoundary.js`
              )
            ).text();

            test.expect(rootErrorBoundaryJs).toContain('virtual/root-error-boundary.js');
            test.expect(rootErrorBoundaryJs).toContain('hydrateRoot');
          });
        });

        test.describe('app-assets', () => {
          test.use({
            inputParameters: {
              name: 'app-assets',
              rootDir: testSuiteFolder,
              buildType: 'client',
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('assets: should inline url for woff2 fonts and emit file', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            const fontName = statsJson.chunks[0].auxiliaryFiles.find((file: string) =>
              file.endsWith('.woff2')
            );
            test.expect(platformJs).toContain(fontName);

            const fontResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/${fontName}`
            );

            test.expect(fontResponse.headers.get('content-type')).toBe('font/woff2');
          });

          test('assets: should inline url for svg image and emit file', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            const iconName = statsJson.chunks[0].auxiliaryFiles.find((file: string) =>
              file.endsWith('.svg')
            );

            test.expect(platformJs).toContain(iconName);

            const iconResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/${iconName}`
            );

            test.expect(iconResponse.headers.get('content-type')).toBe('image/svg+xml');
          });
        });
      });

      // MARK: UNIVERSAL
      test.describe('universal', () => {
        test.describe('app-jsx', () => {
          test.use({
            inputParameters: {
              name: 'app-jsx',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('transpiler: should transpile jsx from JS and TS files', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('jsxDEV');
            test.expect(platformJs).toContain('foo');
            test.expect(platformJs).toContain('bar');
            test.expect(serverJs).toContain('jsxDEV');
            test.expect(serverJs).toContain('foo');
            test.expect(serverJs).toContain('bar');

            // react-element-info-unique plugin
            test.expect(platformJs).toContain('data-qa-file');
            test.expect(serverJs).toContain('data-qa-file');
          });
        });

        test.describe('app-css-modules', () => {
          test.use({
            inputParameters: {
              name: 'app-css-modules',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('css-modules: should process CSS Modules and emit css chunks for client build', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const platformCss = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
            ).text();
            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const serverCssResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/server/platform.css`
            );

            test.expect(platformJs).toContain('style-module__header_');
            test.expect(platformCss).toContain('style-module__header_');
            test.expect(platformCss).toContain('color: red;');
            test.expect(platformCss).not.toContain('-webkit-user-select: none;');
            test.expect(platformCss).toContain('padding: 8px;');
            test.expect(serverJs).toContain('style-module__header_');
            test.expect(serverCssResponse.status).toBe(404);
          });
        });

        test.describe('app-postcss', () => {
          test.use({
            inputParameters: {
              name: 'app-postcss',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('postcss: should respect postcss.config.js with plain configuration', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const platformCss = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
            ).text();

            test.expect(platformCss).toContain('-webkit-user-select: none;');
            test.expect(platformCss).toContain('padding: 8px;');
          });
        });

        test.describe('app-postcss-fn', () => {
          test.use({
            inputParameters: {
              name: 'app-postcss-fn',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('postcss: should respect postcss.config.js with function configuration', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const platformCss = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
            ).text();

            test.expect(platformCss).toContain('-webkit-user-select: none;');
            test.expect(platformCss).toContain('padding: 8px;');
          });
        });

        test.describe('app-fs-routing', () => {
          test.use({
            inputParameters: {
              name: 'app-fs-routing',
              rootDir: testSuiteFolder,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('file-system-pages: "virtual/file-system-pages" import should be updated after changes in "routes" and "pages" directories', async ({
            devServer,
          }) => {
            await devServer.buildPromise;
            // TODO: immediate rebuild because "pages" folder is absent
            await sleep(200);

            let platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            let serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('foo');
            test.expect(serverJs).toContain('foo');

            // MARK: NEW FILE IN EXISTED FOLDER

            const newRouteFile = path.resolve(
              fixturesFolder,
              `application`,
              'fs-routing',
              'routes',
              'bar',
              'index.tsx'
            );

            // TODO: support concurrent tests
            await fs.promises.mkdir(path.dirname(newRouteFile), { recursive: true });
            await fs.promises.writeFile(
              newRouteFile,
              `const Page = () => <h1>Page</h1>;
export default Page;`,
              'utf-8'
            );

            await sleep(100);

            platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('bar');
            test.expect(serverJs).toContain('bar');

            // MARK: NEW FOLDER AND FILE

            const newPagesFile = path.resolve(
              fixturesFolder,
              `application`,
              'fs-routing',
              'pages',
              'baz',
              'index.tsx'
            );

            // TODO: support concurrent tests
            await fs.promises.mkdir(path.dirname(newPagesFile), { recursive: true });
            await fs.promises.writeFile(
              newPagesFile,
              `const Cmp = () => <h1>Cmp</h1>;
export default Cmp;`,
              'utf-8'
            );

            await sleep(100);

            platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('baz');
            test.expect(serverJs).toContain('baz');

            // MARK: CHANGED FILE

            const changedRouteFile = path.resolve(
              fixturesFolder,
              `application`,
              'fs-routing',
              'routes',
              'bar',
              'TEST.tsx'
            );

            // TODO: support concurrent tests
            await fs.promises.rename(newRouteFile, changedRouteFile);

            await sleep(100);

            platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).not.toContain('bar');
            test.expect(serverJs).not.toContain('bar');
          });
        });

        test.describe('app-config-to-env', () => {
          test.use({
            inputParameters: {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('define: should replace constants', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('enableFsPages ${true}');
            test.expect(platformJs).toContain('customPagesDir');
            test.expect(platformJs).toContain('customRoutesDir');
            test.expect(platformJs).toContain('from-options');
            test.expect(platformJs).toContain('enableConcurrentFeatures ${true}');
            test.expect(platformJs).toContain("enableViewTransitions ${'true'}");
            test.expect(platformJs).toContain("enableReactTransitions ${'true'}");
            test.expect(platformJs).toContain('development');
            test.expect(platformJs).toContain('app-config-to-env');

            test.expect(serverJs).toContain('enableFsPages ${true}');
            test.expect(serverJs).toContain('customPagesDir');
            test.expect(serverJs).toContain('customRoutesDir');
            test.expect(serverJs).toContain('from-options');
            test.expect(serverJs).toContain('enableConcurrentFeatures ${true}');
            test.expect(serverJs).toContain("enableViewTransitions ${'true'}");
            test.expect(serverJs).toContain("enableReactTransitions ${'true'}");
            test.expect(serverJs).toContain('development');
            test.expect(serverJs).toContain('app-config-to-env');
          });
        });

        test.describe('app-assets', () => {
          test.use({
            inputParameters: {
              name: 'app-assets',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('assets: should support svgr and inline React components from .svg?react import', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain('SvgPlus');
            test.expect(platformJs).toContain('SvgPlus');
            test.expect(serverJs).toContain('\"data-qa-file\": \"plus\"');
            test.expect(platformJs).toContain('\"data-qa-file\": \"plus\"');
          });
        });

        test.describe('app-externals', () => {
          test.use({
            inputParameters: {
              name: 'app-externals',
              rootDir: testSuiteFolder,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('externals: should prevent externals for bundling', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain('require(\"@sotqa/mountebank-fork\")');
            // TODO: with current API for browser build externals technically useful,
            // because you can'y specify global variable for external client package
            test.expect(platformJs).toContain('module.exports = @sotqa/mountebank-fork;');
          });
        });
      });
    });

    // test.describe('api: application build', () => {});
  });
}
/* eslint-enable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */
