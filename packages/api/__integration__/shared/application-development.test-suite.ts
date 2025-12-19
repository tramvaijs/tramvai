/* eslint-disable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */

import path from 'node:path';
import fs from 'node:fs';
import { outputFile } from 'fs-extra';
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
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
    },
    'app-mf-host': {
      name: 'app-mf-host',
      type: 'application',
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    'app-mf-host-disabled-tramvai-dependencies': {
      name: 'app-mf-host-disabled-tramvai-dependencies',
      type: 'application',
      shared: {
        defaultTramvaiDependencies: false,
        deps: ['@tinkoff/url'],
      },
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    'app-mf-host-disabled-tramvai-flexible': {
      name: 'app-mf-host-disabled-tramvai-flexible',
      type: 'application',
      shared: {
        flexibleTramvaiVersions: false,
        deps: ['@tinkoff/url'],
      },
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    'app-mf-host-critical-chunks': {
      name: 'app-mf-host-critical-chunks',
      type: 'application',
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      shared: {
        criticalChunks: ['data'],
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    'app-mf-host-deps': {
      name: 'app-mf-host-deps',
      type: 'application',
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      shared: {
        deps: ['external-library', '@tinkoff/url'],
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    'app-mf-host-disabled-auto-resolve-shared': {
      name: 'app-mf-host-disabled-auto-resolve-shared',
      type: 'application',
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      shared: {
        deps: ['@tinkoff/url', '@tinkoff/logger'],
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    'app-mf-host-auto-resolve-shared': {
      name: 'app-mf-host-auto-resolve-shared',
      type: 'application',
      webpack: {
        resolveAlias: {
          '@tinkoff/url': './node_modules/@tinkoff/url/index.js',
        },
      },
      shared: {
        deps: ['@tinkoff/url', '@tinkoff/logger'],
        flexibleTramvaiVersions: false,
      },
      experiments: {
        autoResolveSharedRequiredVersions: true,
      },
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'mf-host', 'index.tsx'),
    },
    // TODO: тест на stats purify (PurifyStatsPlugin)
    'app-integrity': {
      name: 'app-integrity',
      type: 'application',
      integrity: {
        enabled: true,
      },
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
    },
    'app-bundle-multiple-runtime': {
      name: 'app-bundle-multiple-runtime',
      runtimeChunk: false,
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
    },
    'app-output-relative': {
      name: 'app-bundle',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
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
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'virtual-module-config', 'index.ts'),
    },
    'app-broken': {
      name: 'app-broken',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'broken', 'index.ts'),
    },
    'app-broken-ssr': {
      name: 'app-broken-ssr',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'broken-ssr', 'index.ts'),
    },
    'app-jsx': {
      name: 'app-jsx',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      generateDataQaTag: true,
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
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'postcss'),
      entryFile: 'index.ts',
      postcss: {
        config: 'postcss.config.js',
      },
    },
    'app-postcss-fn': {
      name: 'app-postcss-fn',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'postcss-fn'),
      entryFile: 'index.ts',
      postcss: {
        config: 'postcss.config.js',
      },
    },
    'app-lightningcss': {
      name: 'app-lightningcss',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      experiments: {
        lightningcss: true,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'lightningcss'),
      entryFile: 'index.ts',
    },
    'app-fs-routing': {
      name: 'app-fs-routing',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      fileSystemPages: {
        enabled: true,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'fs-routing'),
      entryFile: 'index.ts',
    },
    'app-config-to-env': {
      name: 'app-config-to-env',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
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
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'root-error-boundary'),
      entryFile: 'index.ts',
      fileSystemPages: {
        rootErrorBoundaryPath: 'error.tsx',
      },
    },
    'app-browserslist': {
      name: 'app-browserslist',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'browserslist'),
      entryFile: 'index.ts',
    },
    'app-polyfills': {
      name: 'app-polyfills',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'polyfills'),
      entryFile: 'index.ts',
    },
    'app-polyfills-custom': {
      name: 'app-polyfills',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      polyfill: path.join(fixturesFolder, 'application', 'polyfills', 'polyfill.ts'),
      modernPolyfill: path.join(fixturesFolder, 'application', 'polyfills', 'modern.polyfill.ts'),
      sourceDir: path.join(fixturesFolder, 'application', 'polyfills'),
      entryFile: 'index.ts',
    },
    'app-tramvai-vendor': {
      name: 'app-tramvai-vendor',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'tramvai-vendor', 'index.ts'),
    },
    'app-granular-chunks': {
      name: 'app-granular-chunks',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
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
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      generateDataQaTag: true,
      entryFile: path.join(fixturesFolder, 'application', 'assets', 'index.ts'),
    },
    'app-cache': {
      name: 'app-cache',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'assets', 'index.ts'),
    },
    'app-externals': {
      name: 'app-externals',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      generateDataQaTag: true,
      entryFile: path.join(fixturesFolder, 'application', 'externals', 'index.ts'),
    },
    'app-papi': {
      name: 'app-papi',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'papi'),
      entryFile: path.join(fixturesFolder, 'application', 'papi', 'index.ts'),
      fileSystemPapiDir: 'papi',
    },
    'app-server-inline': {
      name: 'app-server-inline',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'server-inline', 'index.ts'),
    },
    'app-pwa': {
      name: 'app-pwa',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
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
      sourceDir: path.join(fixturesFolder, 'application', 'app-pwa'),
    },
    'custom-pwa': {
      name: 'custom-pwa',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
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
      sourceDir: path.join(fixturesFolder, 'application', 'app-pwa'),
    },
    'app-refresh': {
      name: 'app-refresh',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'refresh', 'index.tsx'),
    },
    'app-hmr': {
      name: 'app-hmr',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'assets', 'index.ts'),
    },
    'app-refresh-disabled': {
      name: 'app-refresh-disabled',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'refresh-disabled', 'index.tsx'),
    },
    'app-provide': {
      name: 'app-provide',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'provide', 'index.ts'),
      webpack: {
        provide: {
          measureTimeMark: path.join(fixturesFolder, 'application', 'provide', 'global.ts'),
        },
      },
    },
    'app-devtool-inline': {
      name: 'app-devtool-inline',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
      webpack: {
        devtool: 'inline-nosources-cheap-module-source-map',
      },
    },
    'app-devtool-external': {
      name: 'app-provide-external',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
      webpack: {
        devtool: 'nosources-cheap-module-source-map',
      },
    },
    'app-sourcemaps': {
      name: 'app-sourcemaps',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'bundle', 'index.ts'),
      sourceMap: true,
    },
    'app-resolve': {
      name: 'app-resolve',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      entryFile: path.join(fixturesFolder, 'application', 'resolve', 'index.ts'),
      webpack: {
        resolveFallback: {
          os: require.resolve('os-browserify/browser'),
        },
        resolveAlias: {
          'components/*': path.join(fixturesFolder, 'application', 'resolve', 'components/*'),
        },
      },
    },
    'app-tsconfig-paths': {
      name: 'app-tsconfig-paths',
      type: 'application',
      hotRefresh: {
        enabled: false,
      },
      sourceDir: path.join(fixturesFolder, 'application', 'tsconfig-paths'),
    },
    'app-enable-fill-declare-action-name': {
      name: 'app-enable-fill-declare-action-name',
      type: 'application',
      entryFile: path.join(
        fixturesFolder,
        'application',
        'enable-fill-declare-action-name',
        'index.ts'
      ),
      enableFillDeclareActionNamePlugin: true,
    },
    'app-node-modules-transpilation-only-modern': {
      name: 'app-node-modules-transpilation-only-modern',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'node-modules-transpilation', 'index.ts'),
    },
    'app-node-modules-transpilation': {
      name: 'app-node-modules-transpilation',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'node-modules-transpilation', 'index.ts'),
      transpilation: {
        include: {
          development: 'all',
        },
      },
    },
    'app-node-modules-skip-transpilation': {
      name: 'app-node-modules-skip-transpilation',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'node-modules-transpilation', 'index.ts'),
      transpilation: {
        include: {
          development: 'none',
        },
      },
    },
    'app-node-modules-selective-transpilation': {
      name: 'app-node-modules-selective-transpilation',
      type: 'application',
      entryFile: path.join(fixturesFolder, 'application', 'node-modules-transpilation', 'index.ts'),
      transpilation: {
        include: {
          development: ['@tanstack'],
        },
      },
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              fileCache: false,
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
            await sleep(500);

            const serverHtml = await (await fetch(`http://localhost:${devServer.port}`)).text();

            test.expect(serverHtml).toContain('Hello, world!');
          });
        });

        test.describe('app-config-to-env', () => {
          test.use({
            inputParameters: {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
            test.expect(serverJs).toContain('typeof window ${\"undefined\"');
          });
        });

        test.describe('app-root-error-boundary', () => {
          test.use({
            inputParameters: {
              name: 'app-root-error-boundary',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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

            test.expect(serverJs.includes('CascadiaCodePL.woff2')).toBeTruthy();
          });

          test('assets: should inline svg import', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs).toContain('xmlns=');
            test.expect(serverJs).toContain('<svg id=');
          });
        });

        test.describe('app-papi', () => {
          test.use({
            inputParameters: {
              name: 'app-papi',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'server',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'client',
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              buildType: 'client',
              fileCache: false,
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
              fileCache: false,
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

            const runtimeJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/runtime.js`)
            ).text();

            test.expect(runtimeJs).toContain('chunkLoadingGlobal');
            test.expect(runtimeJs).toContain('webpackChunkapplication_app_bundle_0_0_0_stub');

            // check that desctructuring and globalThis exists - it means that build target respect browserslist
            test.expect(runtimeJs).toContain('var [chunkIds, fn, priority] = deferred[i]');
            test.expect(runtimeJs).toContain('globalThis');
          });

          test('bundle: should generate webpack runtime in separate chunk', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const removeUseStrict = (code: string) => code.replace('"use strict";\n', '');

            const runtimeJsResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
            );
            test.expect(runtimeJsResponse.status).toEqual(200);
            const runtimeJs = await runtimeJsResponse.text();

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const dynamicJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/dynamic.chunk.js`)
            ).text();
            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            test.expect(runtimeJs).toContain('__webpack_module_cache__');
            test.expect(removeUseStrict(dynamicJs).startsWith('(globalThis[')).toBeTruthy();
            test.expect(removeUseStrict(platformJs).startsWith('(globalThis[')).toBeTruthy();
            test.expect(statsJson.assetsByChunkName.runtime).toBeTruthy();
          });

          test('Stats assets and integrities fields should be removed', async ({ devServer }) => {
            await devServer.buildPromise;

            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            test.expect(statsJson.assets).toBeUndefined();
            test.expect(statsJson.integrities).toBeUndefined();
          });
        });

        test.describe('app-bundle-multiple-runtime', () => {
          test.use({
            inputParameters: {
              name: 'app-bundle-multiple-runtime',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('bundle: should generate webpack runtime in platform.js chunk', async ({
            devServer,
          }) => {
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

            test.expect(platformJs).toContain('__webpack_module_cache__');
            test
              .expect(dynamicJs.replace('"use strict";\n', '').startsWith('(globalThis['))
              .toBeTruthy();
            test.expect(statsJson.assetsByChunkName.runtime).toBeUndefined();
          });
        });

        test.describe('app-tramvai-vendor', () => {
          test.use({
            inputParameters: {
              name: 'app-tramvai-vendor',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
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

        test.describe('app-integrity', () => {
          test.use({
            inputParameters: {
              name: 'app-integrity',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('Should create integrities field in stats.json', async ({ devServer }) => {
            await devServer.buildPromise;

            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            test.expect(typeof statsJson.integrities).toBeTruthy();
            test
              .expect(statsJson.integrities['platform.js'])
              .toEqual(
                transpiler === 'swc'
                  ? 'sha256-Z3Wrm1PV7SR/hs/E6QR427E7hNaxLUpY3yGqvAbfXu8='
                  : 'sha256-bvsWSLFePua//2VHjyZYcdpE+pD+KWolMTTwGKaj7Zo='
              );
          });
        });

        test.describe('app-granular-chunks', () => {
          test.use({
            inputParameters: {
              name: 'app-granular-chunks',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
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

            const chunks = statsJson.chunks.map((chunk: any) => chunk.files[0]).filter(Boolean);

            test.expect(chunks).toEqual([
              'node_modules_tinkoff_utils_function_noop_js-node_modules_tinkoff_utils_object_each_js-package-4734cb.chunk.js',
              'packages_api___integration___fixtures_application_granular-chunks_pages_bar_tsx.chunk.js',
              'packages_api___integration___fixtures_application_granular-chunks_pages_foo_tsx.chunk.js',
              'platform.js',
              'react.js',
              'runtime.js',
              'shared-node_modules_tinkoff_logger_lib_index_browser_js.chunk.js',
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
                fileCache: false,
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
              fileCache: false,
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
              fileCache: false,
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
              fileCache: false,
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
            test.expect(platformJs).toContain('typeof window ${\"object\"}');
          });
        });

        test.describe('app-root-error-boundary', () => {
          test.use({
            inputParameters: {
              name: 'app-root-error-boundary',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
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
              fileCache: false,
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

            const platformChunk = statsJson.chunks.find(
              (chunk: { id: string }) => chunk.id === 'platform'
            );
            const fontName = platformChunk.auxiliaryFiles.find((file: string) =>
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

            const platformChunk = statsJson.chunks.find(
              (chunk: { id: string }) => chunk.id === 'platform'
            );
            const iconName = platformChunk.auxiliaryFiles.find((file: string) =>
              file.endsWith('.svg')
            );

            test.expect(platformJs).toContain(iconName);

            const iconResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/${iconName}`
            );

            test.expect(iconResponse.headers.get('content-type')).toBe('image/svg+xml');
          });

          // TODO: test for images compressing
          test('assets: should generate blur image with asset', async ({ devServer, page }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            test.expect(platformJs).toContain('blurDataURL');

            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            const imageName = statsJson.chunks[0].auxiliaryFiles.find((file: string) =>
              file.endsWith('.png')
            );

            test.expect(platformJs).toContain(imageName);

            const iconResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/${imageName}`
            );

            test.expect(iconResponse.headers.get('content-type')).toBe('image/png');
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
              disableServerRunnerWaiting: true,
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              fileCache: false,
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

        test.describe('app-lightningcss', () => {
          test.use({
            inputParameters: {
              name: 'app-lightningcss',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('lightningcss: should correctly vendor prefix css', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformCss = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.css`)
            ).text();

            test.expect(platformCss).toContain('-webkit-user-select: none;');
            test.expect(platformCss).toContain('-webkit-image-set(url(');
            test.expect(platformCss).toContain('padding: 8px;');
          });
        });

        test.describe('app-fs-routing', () => {
          test.use({
            inputParameters: {
              name: 'app-fs-routing',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('file-system-pages: "virtual/file-system-pages" import should be updated after changes in "routes" and "pages" directories', async ({
            devServer,
            page,
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

            test.expect(platformJs).toContain('@/routes/foo/index');
            test.expect(serverJs).toContain('@/routes/foo/index');

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

            await sleep(500);

            platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('@/routes/bar/index');
            test.expect(serverJs).toContain('@/routes/bar/index');

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

            await sleep(500);

            platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain('@/pages/baz/index');
            test.expect(serverJs).toContain('@/pages/baz/index');

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

            test.expect(platformJs).not.toContain('@/routes/bar/index');
            test.expect(serverJs).not.toContain('@/routes/bar/index');
          });
        });

        test.describe('enabled react refresh', () => {
          const refreshPath = path.join(fixturesFolder, 'application', 'refresh', 'App.tsx');
          const initialContent = `export const App = () => {
  return <div id="container">hello world</div>;
};
`;
          const outputPromise = outputFile(refreshPath, initialContent);

          test.use({
            inputParameters: {
              name: 'app-refresh',
              rootDir: testSuiteFolder,
              fileCache: false,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should work', async ({ devServer, page }) => {
            await outputPromise;
            await devServer.buildPromise;

            let loadCounter = 0;
            page.on('load', () => loadCounter++);

            const updatedContent = `export const App = () => {
  return <div id="container">super hello world</div>;
};
`;

            await page.goto(`http://localhost:${devServer.port}`);

            test.expect(await page.locator('#container').textContent()).toEqual('hello world');

            await outputFile(refreshPath, updatedContent);
            await page.waitForFunction(
              () => {
                return document.getElementById('container')?.innerHTML !== 'hello world';
              },
              { polling: 2000, timeout: 10000 }
            );

            test
              .expect(await page.locator('#container').textContent())
              .toEqual('super hello world');

            test.expect(loadCounter).toEqual(1);
          });

          test.afterEach(async () => {
            await outputFile(refreshPath, initialContent);
          });
        });

        test.describe('hmr assets', () => {
          test.use({
            inputParameters: {
              name: 'app-hmr',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should generate separate hmr chunk', async ({ devServer }) => {
            await devServer.buildPromise;

            const statsJson = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/stats.json`)
            ).json();

            const chunks = statsJson.chunks.map((chunk: any) => chunk.files[0]);

            test.expect(chunks.includes('hmr.js')).toBeTruthy();
          });
        });

        test.describe('disabled react refresh', () => {
          const refreshPath = path.join(
            fixturesFolder,
            'application',
            'refresh-disabled',
            'App.tsx'
          );
          const initialContent = `export const App = () => {
  return <div id="container">hello world</div>;
};
`;
          const outputPromise = outputFile(refreshPath, initialContent);

          test.use({
            inputParameters: {
              name: 'app-refresh-disabled',
              rootDir: testSuiteFolder,
              fileCache: false,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should reload page', async ({ devServer, page }) => {
            await outputPromise;
            await devServer.buildPromise;

            const updatedContent = `export const App = () => {
  return <div id="container">super hello world</div>;
};
`;

            await page.goto(`http://localhost:${devServer.port}`);

            test.expect(await page.locator('#container').textContent()).toEqual('hello world');

            await sleep(1000);
            await outputFile(refreshPath, updatedContent);
            await sleep(1000);

            test
              .expect(await page.locator('#container').textContent())
              .toEqual('super hello world');
          });

          test.afterEach(async () => {
            await outputFile(refreshPath, initialContent);
          });
        });

        test.describe('app-config-to-env', () => {
          test.use({
            inputParameters: {
              name: 'app-config-to-env',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
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
              disableServerRunnerWaiting: true,
              fileCache: false,
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

        test.describe('app-cache', () => {
          test.use({
            inputParameters: {
              name: 'app-cache',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: true,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test.beforeEach(async () => {
            await fs.promises.rm(
              path.resolve(__dirname, `../webpack-${transpiler}/node_modules/.cache/webpack`),
              {
                recursive: true,
                force: true,
              }
            );
          });

          test('cache: should generate build cache', async ({ devServer }) => {
            await devServer.buildPromise;
            await devServer.close();

            const cacheFiles = await fs.readdirSync(
              path.resolve(__dirname, `../webpack-${transpiler}/node_modules/.cache/webpack`)
            );

            test.expect(cacheFiles.length).toBe(2);
          });

          test('cache: should reuse build cache', async ({ devServer }) => {
            await devServer.buildPromise;
            await devServer.close();

            const cacheFiles = await fs.readdirSync(
              path.resolve(__dirname, `../webpack-${transpiler}/node_modules/.cache/webpack`)
            );

            test.expect(cacheFiles.length).toBe(2);
          });
        });

        test.describe('app-externals', () => {
          test.use({
            inputParameters: {
              name: 'app-externals',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
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
            const runtimeJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/runtime.js`)
            ).text();

            test.expect(serverJs).toContain('require(\"@sotqa/mountebank-fork\")');
            // TODO: with current API for browser build externals technically useful,
            // because you can't specify global variable for external client package
            test.expect(runtimeJs).toContain('module.exports = @sotqa/mountebank-fork;');
          });
        });

        test.describe('app-provide', () => {
          test.use({
            inputParameters: {
              name: 'app-provide',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('provide: should include module without import with providePlugin', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain('module.exports = measureTimeMark;');
            test.expect(platformJs).toContain('module.exports = measureTimeMark;');
          });
        });

        test.describe('app-resolve', () => {
          test.use({
            inputParameters: {
              name: 'app-resolve',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('resolve: should use custom alias', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain('fixtures/application/resolve/components/header.ts');
            test.expect(platformJs).toContain('fixtures/application/resolve/components/header.ts');
          });

          test('resolve: should use fallback for nodejs apis in client build', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(platformJs).toContain('node_modules/path-browserify/index.js');
            test.expect(platformJs).toContain('node_modules/os-browserify/browser.js');
          });

          test('resolve: should not use fallback for nodejs apis in server build', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(serverJs.includes('node_modules/path-browserify/index.js')).toBeFalsy();
            test.expect(serverJs).toContain('module.exports = require("path");');
            test.expect(serverJs).toContain('module.exports = require("os");');
          });
        });

        test.describe('app-devtool-inline', () => {
          test.use({
            inputParameters: {
              name: 'app-devtool-inline',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('devtool: should generate inline sourcemaps by devtool options', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test
              .expect(serverJs)
              .toContain('//# sourceMappingURL=data:application/json;charset=utf-8;base64,');
            test
              .expect(platformJs)
              .toContain('//# sourceMappingURL=data:application/json;charset=utf-8;base64,');
          });
        });

        test.describe('app-devtool-external', () => {
          test.use({
            inputParameters: {
              name: 'app-devtool-external',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('devtool: should generate external sourcemaps by devtool options', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain('//# sourceMappingURL=server.js.map');
            test.expect(platformJs).toContain('//# sourceMappingURL=platform.js.map');
          });
        });

        test.describe('verbose-logging', () => {
          test.use({
            inputParameters: {
              name: 'app-bundle',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              verboseLogging: true,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('verbose logging: should print all information in process output', async ({
            spawnDevServer,
          }) => {
            const { logs } = spawnDevServer;

            test
              .expect(logs.some((log) => log.includes('LOG from webpack.Compilation')))
              .toBeTruthy();
          });
        });

        test.describe('disabled-verbose-logging', () => {
          test.use({
            inputParameters: {
              name: 'app-bundle',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              verboseLogging: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('verbose logging: disabled', async ({ spawnDevServer }) => {
            const { logs } = spawnDevServer;

            test
              .expect(logs.every((log) => !log.includes('LOG from webpack.Compilation\n')))
              .toBeTruthy();
          });
        });

        test.describe('app-sourcemaps', () => {
          test.use({
            inputParameters: {
              name: 'app-sourcemaps',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('sourcemaps: should generate external sourcemaps', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain('//# sourceMappingURL=data:application/json');
            test.expect(platformJs).toContain('//# sourceMappingURL=platform.js.map');
          });
        });

        test.describe('app-tsconfig-paths', () => {
          test.use({
            inputParameters: {
              name: 'app-tsconfig-paths',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('tsconfig-paths: should resolve paths from tsconfig.json', async ({ devServer }) => {
            await devServer.buildPromise;

            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();
            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();

            test.expect(serverJs).toContain(`foo-bar`);
            test.expect(platformJs).toContain(`foo-bar`);
          });
        });

        test.describe('app-enable-fill-declare-action-name', () => {
          test.use({
            inputParameters: {
              name: 'app-enable-fill-declare-action-name',
              rootDir: testSuiteFolder,
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('transpiler: "fillDeclareActionName" plugin enabled by flag', async ({
            devServer,
          }) => {
            if (transpiler === 'swc') {
              test.skip(true, 'swc plugin "fillDeclareActionName" is not implemented');
              return;
            }

            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const serverJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/server/server.js`)
            ).text();

            test.expect(platformJs).toContain(`name: \"secondAction__`);
            test.expect(serverJs).toContain(`name: \"secondAction__`);
          });
        });

        test.describe('app-node-modules-transpilation', () => {
          test.use({
            inputParameters: {
              name: 'app-node-modules-transpilation',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('transpiler: all node_modules libraries are transpiled', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const tramvaiJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/tramvai.js`)
            ).text();

            test.expect(platformJs).not.toContain(`#value`);
            test.expect(tramvaiJs).not.toContain(`#tramvaiValue`);
          });
        });

        test.describe('app-node-modules-transpilation-only-modern', () => {
          test.use({
            inputParameters: {
              name: 'app-node-modules-transpilation-only-modern',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('transpiler: modern node_modules libraries are transpiled', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const tramvaiJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/tramvai.js`)
            ).text();

            test.expect(platformJs).toContain(`#value`);
            test.expect(tramvaiJs).not.toContain(`#tramvaiValue`);
          });
        });

        test.describe('app-node-modules-skip-transpilation', () => {
          test.use({
            inputParameters: {
              name: 'app-node-modules-skip-transpilation',
              rootDir: testSuiteFolder,
              buildType: 'client',
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('transpiler: node_modules libraries are not transpiled', async ({ devServer }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const tramvaiJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/tramvai.js`)
            ).text();

            test.expect(platformJs).toContain(`#value`);
            test.expect(tramvaiJs).toContain(`#tramvaiValue`);
          });
        });

        test.describe('app-node-modules-selective-transpilation', () => {
          test.use({
            inputParameters: {
              name: 'app-node-modules-selective-transpilation',
              rootDir: testSuiteFolder,
              buildType: 'client',
              disableServerRunnerWaiting: true,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('transpiler: node_modules libraries are partially transpiled', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const platformJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/platform.js`)
            ).text();
            const tramvaiJs = await (
              await fetch(`http://localhost:${devServer.staticPort}/dist/client/tramvai.js`)
            ).text();

            test.expect(platformJs).toContain(`#value`);
            test.expect(tramvaiJs).toContain(`#tramvaiValue`);
            test.expect(platformJs).not.toContain(`#focused`);
          });
        });
      });
    });

    test.describe('microfrontends: runtime', () => {
      test.describe('should correctly build mf runtime', () => {
        test.use({
          inputParameters: {
            name: 'app-mf-host',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('default critical chunks list on client', async ({ devServer, page }) => {
          await devServer.buildPromise;
          await page.goto(`http://localhost:${devServer.port}`);

          const criticalChunksObj = await page.evaluate(
            () => (window as any).webpackChunkapplication_app_mf_host_0_0_0_stub
          );
          const criticalChunks = criticalChunksObj.flat(Infinity).reduce((acc, item) => {
            if (typeof item === 'object') {
              for (const key in item) {
                acc.add(key);
              }
            } else {
              acc.add(item);
            }

            return acc;
          }, new Set());

          test
            .expect(
              ['react', 'platform', 'tramvai'].every((chunkName) => criticalChunks.has(chunkName))
            )
            .toBeTruthy();
        });

        test('client runtime shoud contain used shared module', async ({ devServer }) => {
          await devServer.buildPromise;

          const runtimeResponse = await fetch(
            `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
          );
          const runtimeCode = await runtimeResponse.text();

          test.expect(runtimeCode).toContain('register("react-dom", "19.0.1"');
          test.expect(runtimeCode).toContain('register("react/jsx-dev-runtime", "19.0.1"');
          test.expect(runtimeCode).toContain('register("react", "19.0.1"');
          test.expect(runtimeCode).toContain('register("@tinkoff/dippy", "0.0.0-stub"');
        });

        test('client runtime shoud not contain unused shared module', async ({ devServer }) => {
          await devServer.buildPromise;

          const runtimeResponse = await fetch(
            `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
          );
          const runtimeCode = await runtimeResponse.text();

          test.expect(runtimeCode.includes('@tramvai/react')).toBeFalsy();
          test.expect(runtimeCode.includes('@tramvai/core')).toBeFalsy();
        });

        test('server runtime should contain shared modules', async ({ devServer, page }) => {
          await devServer.buildPromise;
          await page.goto(`http://localhost:${devServer.port}`);

          const mfServerModules = await page.evaluate(() => (window as any).serverMfModules);

          test
            .expect(
              mfServerModules.includes(
                'webpack/sharing/consume/default/react/jsx-dev-runtime/react/jsx-dev-runtime'
              )
            )
            .toBeTruthy();

          test
            .expect(
              mfServerModules.includes(
                'webpack/sharing/consume/default/@tinkoff/dippy/@tinkoff/dippy'
              )
            )
            .toBeTruthy();
        });

        test('shared modules on server', async ({ devServer, page }) => {
          await devServer.buildPromise;
          await page.goto(`http://localhost:${devServer.port}`);

          const mfServerShared = await page.evaluate(() => (window as any).serverShared);
          test.expect(mfServerShared.default).toEqual({
            '@tinkoff/dippy': {
              '0.0.0-stub': {
                eager: true,
                from: 'application:app-mf-host:0.0.0-stub',
                loaded: 1,
              },
            },
            'react/jsx-dev-runtime': {
              '19.0.1': { eager: true, from: 'application:app-mf-host:0.0.0-stub', loaded: 1 },
            },
          });
        });
      });

      test.describe('defaultTramvaiDependencies disabled option', () => {
        test.use({
          inputParameters: {
            name: 'app-mf-host-disabled-tramvai-dependencies',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should not use default tramvai dependencies in shared on client', async ({
          devServer,
        }) => {
          await devServer.buildPromise;

          const runtimeResponse = await fetch(
            `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
          );
          const runtimeCode = await runtimeResponse.text();

          test.expect(runtimeCode.includes('@tinkoff/dippy')).toBeFalsy();
        });

        test('should not use default tramvai dependencies in shared on server', async ({
          devServer,
          page,
        }) => {
          await devServer.buildPromise;
          await page.goto(`http://localhost:${devServer.port}`);

          const mfServerShared = await page.evaluate(() => (window as any).serverShared);

          // no @tinkoff/dippy in shared deps
          test.expect(mfServerShared.default).toEqual({
            '@tinkoff/url': {
              '1.3.0': {
                from: 'application:app-mf-host-disabled-tramvai-dependencies:0.0.0-stub',
                eager: true,
                loaded: 1,
              },
            },
            'react/jsx-dev-runtime': {
              '19.0.1': {
                eager: true,
                from: 'application:app-mf-host-disabled-tramvai-dependencies:0.0.0-stub',
                loaded: 1,
              },
            },
          });
        });
      });

      test.describe('flexibleTramvaiVersions option', () => {
        test.describe('enabled flexibleTramvaiVersions', () => {
          test.use({
            inputParameters: {
              name: 'app-mf-host-disabled-tramvai-dependencies',
              rootDir: testSuiteFolder,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should correctly flex version for tinkoff/url dep on client', async ({
            devServer,
            page,
          }) => {
            await devServer.buildPromise;

            const runtimeResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
            );
            const runtimeCode = await runtimeResponse.text();

            // [1,1,3,0] is encoded semver version, first 1 in array is flex version (^)
            test
              .expect(runtimeCode)
              .toContain(
                '"webpack/sharing/consume/default/@tinkoff/url/@tinkoff/url": () => (loadStrictVersion("default", "@tinkoff/url", true, [1,1,3,0]'
              );
          });

          test('should correctly flex version for tinkoff/url dep on server', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverCodeResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/server/server.js`
            );
            const serverCode = await serverCodeResponse.text();

            // [1,1,3,0] is encoded semver version, first 1 in array is flex version (^)
            test
              .expect(serverCode)
              .toContain(
                '"webpack/sharing/consume/default/@tinkoff/url/@tinkoff/url": () => (loadStrictVersion("default", "@tinkoff/url", true, [1,1,3,0]'
              );
          });
        });

        test.describe('disabled flexibleTramvaiVersions', () => {
          test.use({
            inputParameters: {
              name: 'app-mf-host-disabled-tramvai-flexible',
              rootDir: testSuiteFolder,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should correctly not flex version for tinkoff/url dep on client', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const runtimeResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
            );
            const runtimeCode = await runtimeResponse.text();

            // // [4,1,3,0] is encoded semver version, first 4 in array is strict version
            test
              .expect(runtimeCode)
              .toContain(
                '"webpack/sharing/consume/default/@tinkoff/url/@tinkoff/url": () => (loadStrictVersion("default", "@tinkoff/url", true, [4,1,3,0]'
              );
          });

          test('should correctly not flex version for tinkoff/url dep on server', async ({
            devServer,
          }) => {
            await devServer.buildPromise;
            const serverCodeResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/server/server.js`
            );
            const serverCode = await serverCodeResponse.text();

            // // [4,1,3,0] is encoded semver version, first 4 in array is strict version
            test
              .expect(serverCode)
              .toContain(
                '"webpack/sharing/consume/default/@tinkoff/url/@tinkoff/url": () => (loadStrictVersion("default", "@tinkoff/url", true, [4,1,3,0]'
              );
          });
        });
      });

      test.describe('criticalChunks option', () => {
        test.use({
          inputParameters: {
            name: 'app-mf-host-critical-chunks',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should correctly add custom critical chunk', async ({ devServer, page }) => {
          await devServer.buildPromise;
          await page.goto(`http://localhost:${devServer.port}`);

          const criticalChunksRaw = await page.evaluate(
            () => (window as any).webpackChunkapplication_app_mf_host_critical_chunks_0_0_0_stub
          );
          const criticalChunks = criticalChunksRaw
            .flat(Infinity)
            .reduce((acc: Set<string>, item: Record<string, string> | string) => {
              if (typeof item === 'object') {
                for (const key in item) {
                  acc.add(key);
                }
              } else {
                acc.add(item);
              }

              return acc;
            }, new Set());

          test.expect(criticalChunks.has('data')).toBeTruthy();
        });
      });

      test.describe('deps option', () => {
        test.use({
          inputParameters: {
            name: 'app-mf-host-deps',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should correctly add custom deps on client', async ({ devServer, page }) => {
          await devServer.buildPromise;

          const runtimeResponse = await fetch(
            `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
          );
          const runtimeCode = await runtimeResponse.text();

          test.expect(runtimeCode).toContain('register("external-library", "3.0.0"');
        });

        test('should correctly add custom deps on server', async ({ devServer, page }) => {
          await devServer.buildPromise;

          const serverCodeResponse = await fetch(
            `http://localhost:${devServer.staticPort}/dist/server/server.js`
          );
          const serverCode = await serverCodeResponse.text();

          test.expect(serverCode).toContain('register("external-library", "3.0.0"');
        });
      });

      test.describe('app-mf-host-auto-resolve-shared', () => {
        test.describe('disabled', async () => {
          test.use({
            inputParameters: {
              name: 'app-mf-host-disabled-auto-resolve-shared',
              rootDir: testSuiteFolder,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should generate warnings in build logs about wrong package version', async ({
            spawnDevServer,
          }) => {
            const { logs } = spawnDevServer;

            test
              .expect(
                logs.some((log) =>
                  log.includes(
                    'version specified and unable to automatically determine one. Unable to find'
                  )
                )
              )
              .toBeTruthy();
          });
        });

        test.describe('enabled', () => {
          test.use({
            inputParameters: {
              name: 'app-mf-host-auto-resolve-shared',
              rootDir: testSuiteFolder,
              fileCache: false,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test('should use requiredVersion field for tinkoff/logger on client', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const runtimeResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/client/runtime.js`
            );
            const runtimeCode = await runtimeResponse.text();

            test
              .expect(runtimeCode)
              .toContain(
                '"webpack/sharing/consume/default/@tinkoff/logger/@tinkoff/logger": () => (loadStrictVersion("default", "@tinkoff/logger", true, [2,0,10,514]'
              );
          });

          test('should use requiredVersion field for tinkoff/logger on server', async ({
            devServer,
          }) => {
            await devServer.buildPromise;

            const serverCodeResponse = await fetch(
              `http://localhost:${devServer.staticPort}/dist/server/server.js`
            );
            const serverCode = await serverCodeResponse.text();

            test
              .expect(serverCode)
              .toContain(
                '"webpack/sharing/consume/default/@tinkoff/logger/@tinkoff/logger": () => (loadStrictVersion("default", "@tinkoff/logger", true, [2,0,10,514]'
              );
          });

          test('should be no warnings in build logs about wrong package version', ({
            spawnDevServer,
          }) => {
            const { logs } = spawnDevServer;

            test
              .expect(
                logs.some((log) =>
                  log.includes(
                    'version specified and unable to automatically determine one. Unable to find'
                  )
                )
              )
              .toBeFalsy();
          });
        });
      });
    });

    // test.describe('api: application build', () => {});
  });
}
/* eslint-enable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */
