/* eslint-disable no-useless-escape, no-template-curly-in-string, max-nested-callbacks */
import path from 'node:path';
import fs from 'node:fs';
import { outputFile } from 'fs-extra';

import { ChildAppProject, ApplicationProject } from '@tramvai/api/lib/config';
import { sleep } from '@tramvai/test-integration';

import { test } from './test.fixture';

const version = '0.0.0-stub';
const hashRegexp = /\.chunk\..*?\.js/;

async function getAssetsList(port: number, buildType?: 'server' | 'client'): Promise<string[]> {
  const headers: Record<string, string> = {};

  if (buildType) {
    headers['x-build-type'] = buildType;
  }

  return (await fetch(`http://localhost:${port}/webpack-dev-server-json`, { headers })).json();
}

async function fetchAssetByPattern(
  port: number,
  childAppName: string,
  pattern: string | RegExp,
  buildType?: 'server' | 'client'
): Promise<string> {
  const assetsList = await getAssetsList(port, buildType);
  const assetName = assetsList.find((asset) =>
    typeof pattern === 'string' ? asset.includes(pattern) : pattern.test(asset)
  );

  if (!assetName) {
    throw new Error(
      `Asset not found for pattern "${pattern}", available assets:\n${assetsList.join('\n')}`
    );
  }

  const url = `http://localhost:${port}/${childAppName}/${assetName}`;

  return (await fetch(url)).text();
}

export function createTestSuite({ key, plugins }: { key: string; plugins: string[] }) {
  const testSuiteFolder = path.resolve(__dirname, '..', key);
  const fixturesFolder = path.resolve(__dirname, '..', 'fixtures');

  const projects: Record<string, ChildAppProject | ApplicationProject> = {
    application: {
      name: 'application',
      type: 'application',
      hotRefresh: {
        enabled: true,
      },
      entryFile: path.join(fixturesFolder, 'application', 'host', 'index.tsx'),
    },
    base: {
      name: 'base',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'base'),
    },
    hot: {
      name: 'hot',
      type: 'child-app',
      hotRefresh: {
        enabled: true,
      },
      sourceDir: path.join(fixturesFolder, 'child-app', 'hot'),
    },
    refresh: {
      name: 'refresh',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'refresh'),
    },
    assets: {
      name: 'assets',
      type: 'child-app',
      generateDataQaTag: true,
      sourceDir: path.join(fixturesFolder, 'child-app', 'assets'),
    },
    define: {
      name: 'define',
      type: 'child-app',
      generateDataQaTag: true,
      sourceDir: path.join(fixturesFolder, 'child-app', 'define'),
    },
    css: {
      name: 'css',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'css'),
    },
    postcss: {
      name: 'postcss',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'postcss'),
      postcss: {
        config: 'postcss.config.js',
      },
    },
    jsx: {
      name: 'jsx',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'jsx'),
    },
    fillDeclareAction: {
      name: 'fillDeclareAction',
      type: 'child-app',
      enableFillDeclareActionNamePlugin: true,
      sourceDir: path.join(fixturesFolder, 'child-app', 'fill-declare-action'),
    },
    'node-modules-transpilation': {
      name: 'node-modules-transpilation',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'node-modules-transpilation'),
      transpilation: {
        include: {
          development: 'all',
        },
      },
    },
    'node-modules-transpilation-only-modern': {
      name: 'node-modules-transpilation-only-modern',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'node-modules-transpilation'),
    },
    'node-modules-skip-transpilation': {
      name: 'node-modules-skip-transpilation',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'node-modules-transpilation'),
      transpilation: {
        include: {
          development: 'none',
        },
      },
    },
    'node-modules-selective-transpilation': {
      name: 'node-modules-selective-transpilation',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'node-modules-transpilation'),
      transpilation: {
        include: {
          development: ['@tanstack'],
        },
      },
    },
    sourcemaps: {
      name: 'sourcemaps',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'base'),
      sourceMap: true,
    },
    devtoolInline: {
      name: 'sourcemaps',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'base'),
      webpack: {
        devtool: 'inline-nosources-cheap-module-source-map',
      },
    },
    devtoolExternal: {
      name: 'sourcemaps',
      type: 'child-app',
      sourceDir: path.join(fixturesFolder, 'child-app', 'base'),
      webpack: {
        devtool: 'nosources-cheap-module-source-map',
      },
    },
    resolve: {
      name: 'resolve',
      type: 'child-app',
      webpack: {
        resolveFallback: {
          os: require.resolve('os-browserify/browser'),
        },
        resolveAlias: {
          components: path.join(fixturesFolder, 'child-app', 'resolve', 'components'),
        },
      },
      sourceDir: path.join(fixturesFolder, 'child-app', 'resolve'),
    },
  };

  const [builder, transpiler] = key.split('-');

  test.describe(`@tramvai/api @builder:${builder} @transpiler:${transpiler} @type:child-app @mode:development`, async () => {
    test.describe('api: child-app start', () => {
      test.describe('static generation', () => {
        test.use({
          inputParameters: {
            name: 'base',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('all child-app client assets should be generated', async ({ devServer }) => {
          await devServer.buildPromise;

          const assetsList = await getAssetsList(devServer.port);

          const assetPaths = assetsList.map((asset: string) =>
            asset.replace(hashRegexp, '.chunk.js')
          );

          test
            .expect(assetPaths)
            .toEqual([
              'base_client@0.0.0-stub.js',
              'node_modules_tinkoff_dippy_lib_di_es_js_client.chunk.js',
              'base_stats_loadable@0.0.0-stub.json',
              'fixtures_child-app_base_index_ts_client.chunk.js',
              'base_stats@0.0.0-stub.json',
            ]);
        });

        test('all child-app server assets should be generated', async ({ devServer }) => {
          await devServer.buildPromise;

          const assetsList = await getAssetsList(devServer.port, 'server');

          const assetPaths = assetsList.map((asset: string) =>
            asset.replace(`http://localhost:${devServer.port}`, '').replace(hashRegexp, '.chunk.js')
          );

          test
            .expect(assetPaths)
            .toEqual([
              'node_modules_tinkoff_dippy_lib_di_es_js_server.chunk.js',
              'base_server@0.0.0-stub.js',
              'fixtures_child-app_base_index_ts_server.chunk.js',
            ]);
        });
      });

      test.describe('childapp runtime', () => {
        test.use({
          inputParameters: {
            name: 'base',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('client runtime should contain container entry init', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await (
            await fetch(`http://localhost:${devServer.port}/base/base_client@${version}.js`)
          ).text();

          test
            .expect(clientJs)
            .toContain(
              'return __webpack_require__.e("fixtures_child-app_base_index_ts").then(() => (() => ((__webpack_require__("../fixtures/child-app/base/index.ts")))));'
            );
        });

        test('client runtime should contain patched auto public path', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await (
            await fetch(`http://localhost:${devServer.port}/base/base_client@${version}.js`)
          ).text();

          test
            .expect(clientJs)
            .toContain(
              'scriptUrl = document.currentScript.src || document.currentScript.dataset.src;'
            );
        });

        test('server runtime should contain container entry init', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.port}/base/base_server@${version}.js`)
          ).text();

          test
            .expect(serverJs)
            .toContain(
              'return __webpack_require__.e("fixtures_child-app_base_index_ts").then(function() { return function() { return (__webpack_require__("../fixtures/child-app/base/index.ts")); }; });'
            );
        });

        test('server runtime should contain custom entrypoint', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverJs = await (
            await fetch(`http://localhost:${devServer.port}/base/base_server@${version}.js`)
          ).text();

          test
            .expect(serverJs)
            .toContain(
              `__webpack_require__.g.__remote_scope__ = __webpack_require__.g.__remote_scope__ || {`
            );

          test
            .expect(serverJs)
            .toContain(
              `__webpack_require__.g.__remote_scope__._config["base"] = __webpack_require__.g.__remote_scope__._config["base"] || ASSETS_PREFIX + 'server.js';`
            );
        });
      });

      test.describe('stats', () => {
        test.use({
          inputParameters: {
            name: 'base',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('stats should contain all client assets', async ({ devServer }) => {
          await devServer.buildPromise;

          const stats = await (
            await fetch(`http://localhost:${devServer.port}/base/base_stats@${version}.json`)
          ).json();

          test.expect(stats).toMatchObject({
            sharedModules: [],
            federatedModules: [
              {
                remote:
                  'window["child-app__" + (document.currentScript.src || document.currentScript.dataset.src)]',
                entry: 'undefined',
                sharedModules: [
                  {
                    chunks: [test.expect.any(String)],
                    provides: [
                      {
                        shareScope: 'default',
                        shareKey: '@tinkoff/dippy',
                        requiredVersion: '^1.0.1',
                        strictVersion: true,
                        singleton: false,
                        eager: false,
                      },
                    ],
                  },
                ],
                exposes: { entry: [] },
                remoteModules: {},
              },
            ],
          });
        });

        test('loadable stats should contain all client assets', async ({ devServer }) => {
          await devServer.buildPromise;

          const loadableStats = await (
            await fetch(
              `http://localhost:${devServer.port}/base/base_stats_loadable@${version}.json`
            )
          ).json();

          test.expect(loadableStats).toEqual({
            name: 'client',
            publicPath: 'auto',
            outputPath: test.expect.any(String),
            assetsByChunkName: { base: ['base_client@0.0.0-stub.js'] },
            assets: [
              {
                name: 'base_client@0.0.0-stub.js',
                type: 'asset',
                chunks: test.expect.any(Array),
                chunkNames: test.expect.any(Array),
              },
              {
                name: test.expect.any(String),
                type: 'asset',
                chunks: test.expect.any(Array),
                chunkNames: [],
              },
              {
                name: test.expect.any(String),
                type: 'asset',
                chunks: test.expect.any(Array),
                chunkNames: [],
              },
            ],
            namedChunkGroups: {
              base: {
                name: 'base',
                chunks: test.expect.any(Array),
                assets: test.expect.any(Array),
                filteredAssets: 0,
                assetsSize: null,
                filteredAuxiliaryAssets: 0,
                auxiliaryAssetsSize: 0,
                children: {},
                childAssets: {},
              },
            },
            generator: 'loadable-components',
            hash: test.expect.any(String),
            chunks: [
              { id: 'base', files: test.expect.any(Array) },
              { id: 'fixtures_child-app_base_index_ts', files: test.expect.any(Array) },
              { id: 'node_modules_tinkoff_dippy_lib_di_es_js', files: test.expect.any(Array) },
            ],
          });
        });
      });

      test.describe('verbose-logging', () => {
        test.use({
          inputParameters: {
            name: 'base',
            rootDir: testSuiteFolder,
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

          const expectedLog = {
            rspack: 'LOG from rspack.Compilation',
            webpack: 'LOG from webpack.Compilation',
          };

          test.expect(logs.some((log) => log.includes(expectedLog[builder]))).toBeTruthy();
        });
      });

      test.describe('disabled-verbose-logging', () => {
        test.use({
          inputParameters: {
            name: 'app-bundle',
            rootDir: testSuiteFolder,
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

          const expectedLog = {
            rspack: 'LOG from rspack.persistentCache',
            webpack: 'LOG from webpack.Compilation',
          };

          test.expect(logs.every((log) => !log.includes(expectedLog[builder]))).toBeTruthy();
        });
      });

      test.describe('cache', () => {
        test.describe('child-app-cache', () => {
          test.use({
            inputParameters: {
              name: 'base',
              rootDir: testSuiteFolder,
              fileCache: true,
              noRebuild: true,
            },
            extraConfiguration: {
              plugins,
              projects,
            },
          });

          test.beforeAll(async () => {
            await fs.promises.rm(
              path.resolve(__dirname, `../${builder}-${transpiler}/node_modules/.cache/${builder}`),
              {
                recursive: true,
                force: true,
              }
            );
          });

          test('should generate build cache', async ({ devServer }) => {
            await devServer.buildPromise;
            await devServer.close();

            const cacheFiles = await fs.readdirSync(
              path.resolve(__dirname, `../${builder}-${transpiler}/node_modules/.cache/${builder}`)
            );

            test.expect(cacheFiles.length).toBe(2);
          });

          test('should resuse build cache', async ({ devServer }) => {
            await devServer.buildPromise;
            await devServer.close();

            const cacheFiles = await fs.readdirSync(
              path.resolve(__dirname, `../${builder}-${transpiler}/node_modules/.cache/${builder}`)
            );

            test.expect(cacheFiles.length).toBe(2);
          });
        });
      });

      test.describe('resolve', () => {
        test.use({
          inputParameters: {
            name: 'resolve',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should use custom alias', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'resolve',
            'fixtures_child-app_resolve_index_ts_client.chunk'
          );
          const serverJs = await fetchAssetByPattern(
            devServer.port,
            'resolve',
            'fixtures_child-app_resolve_index_ts_server.chunk',
            'server'
          );

          test.expect(clientJs).toContain('fixtures/child-app/resolve/components/header.ts');
          test.expect(serverJs).toContain('fixtures/child-app/resolve/components/header.ts');
        });

        test('should use fallback for nodejs apis in client build', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'resolve',
            'fixtures_child-app_resolve_index_ts_client.chunk'
          );

          test.expect(clientJs).toContain('node_modules/path-browserify/index.js');
          test.expect(clientJs).toContain('node_modules/os-browserify/browser.js');
        });

        test('should not use fallback for nodejs apis in server build', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverJs = await fetchAssetByPattern(
            devServer.port,
            'resolve',
            'fixtures_child-app_resolve_index_ts_server.chunk',
            'server'
          );

          test.expect(serverJs.includes('node_modules/path-browserify/index.js')).toBeFalsy();

          const serverRuntime = await (
            await fetch(`http://localhost:${devServer.port}/resolve/resolve_server@${version}.js`)
          ).text();
          test.expect(serverRuntime).toContain('module.exports = require("path");');
          test.expect(serverRuntime).toContain('module.exports = require("os");');
        });
      });

      test.describe('sourcemaps', () => {
        test.use({
          inputParameters: {
            name: 'sourcemaps',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should generate sourcemaps', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await (
            await fetch(
              `http://localhost:${devServer.port}/sourcemaps/sourcemaps_client@${version}.js`
            )
          ).text();
          const serverJs = await (
            await fetch(
              `http://localhost:${devServer.port}/sourcemaps/sourcemaps_server@${version}.js`
            )
          ).text();

          test
            .expect(clientJs)
            .toContain(`//# sourceMappingURL=sourcemaps_client@${version}.js.map`);
          test
            .expect(serverJs)
            .toContain(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,`);
        });
      });

      test.describe('devtool inline', () => {
        test.use({
          inputParameters: {
            name: 'devtoolInline',
            rootDir: testSuiteFolder,
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

          const clientJs = await (
            await fetch(
              `http://localhost:${devServer.port}/sourcemaps/sourcemaps_client@${version}.js`
            )
          ).text();
          const serverJs = await (
            await fetch(
              `http://localhost:${devServer.port}/sourcemaps/sourcemaps_server@${version}.js`
            )
          ).text();

          test
            .expect(clientJs)
            .toContain(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,`);
          test
            .expect(serverJs)
            .toContain(`//# sourceMappingURL=data:application/json;charset=utf-8;base64,`);
        });
      });

      test.describe('devtool external', () => {
        test.use({
          inputParameters: {
            name: 'devtoolExternal',
            rootDir: testSuiteFolder,
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

          const clientJs = await (
            await fetch(
              `http://localhost:${devServer.port}/sourcemaps/sourcemaps_client@${version}.js`
            )
          ).text();
          const serverJs = await (
            await fetch(
              `http://localhost:${devServer.port}/sourcemaps/sourcemaps_server@${version}.js`
            )
          ).text();

          test
            .expect(clientJs)
            .toContain(`//# sourceMappingURL=sourcemaps_client@${version}.js.map`);
          test
            .expect(serverJs)
            .toContain(`//# sourceMappingURL=sourcemaps_server@${version}.js.map`);
        });
      });

      test.describe('transpiling', () => {
        test.use({
          inputParameters: {
            name: 'jsx',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('transpiler: should transpile jsx from TSX files', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientChunkJs = await fetchAssetByPattern(
            devServer.port,
            'jsx',
            'fixtures_child-app_jsx_index_ts_client.chunk'
          );

          test.expect(clientChunkJs).toContain('jsxDEV');
        });
      });

      test.describe('fill declare action name babel plugin', () => {
        test.use({
          inputParameters: {
            name: 'fillDeclareAction',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('enabled by flag', async ({ devServer }) => {
          if (transpiler === 'swc') {
            test.skip(true, 'swc plugin "fillDeclareActionName" is not implemented');
            return;
          }

          await devServer.buildPromise;

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'fillDeclareAction',
            'fixtures_child-app_fill-declare-action_index_ts_client.chunk'
          );
          const serverJs = await fetchAssetByPattern(
            devServer.port,
            'fillDeclareAction',
            'fixtures_child-app_fill-declare-action_index_ts_server.chunk',
            'server'
          );

          test.expect(clientJs).toContain(`name: \"secondAction__`);
          test.expect(serverJs).toContain(`name: \"secondAction__`);
        });
      });

      test.describe('node-modules-transpilation', () => {
        test.use({
          inputParameters: {
            name: 'node-modules-transpilation',
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

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'node-modules-transpilation',
            'fixtures_child-app_node-modules-transpilation_index_ts_client.chunk'
          );

          test.expect(clientJs).not.toContain(`#value`);
          test.expect(clientJs).not.toContain(`#tramvaiValue`);
        });
      });

      test.describe('node-modules-transpilation-only-modern', () => {
        test.use({
          inputParameters: {
            name: 'node-modules-transpilation-only-modern',
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

        test('transpiler: modern node_modules libraries are transpiled', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'node-modules-transpilation-only-modern',
            'fixtures_child-app_node-modules-transpilation_index_ts_client.chunk'
          );

          test.expect(clientJs).toContain(`#value`);
          test.expect(clientJs).not.toContain(`#tramvaiValue`);
        });
      });

      test.describe('node-modules-skip-transpilation', () => {
        test.use({
          inputParameters: {
            name: 'node-modules-skip-transpilation',
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

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'node-modules-skip-transpilation',
            'fixtures_child-app_node-modules-transpilation_index_ts_client.chunk'
          );

          test.expect(clientJs).toContain(`#value`);
          test.expect(clientJs).toContain(`#tramvaiValue`);
        });
      });

      test.describe('node-modules-selective-transpilation', () => {
        test.use({
          inputParameters: {
            name: 'node-modules-selective-transpilation',
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

        test('transpiler: node_modules libraries are partially transpiled', async ({
          devServer,
        }) => {
          await devServer.buildPromise;

          const clientJs = await fetchAssetByPattern(
            devServer.port,
            'node-modules-selective-transpilation',
            'fixtures_child-app_node-modules-transpilation_index_ts_client.chunk'
          );

          test.expect(clientJs).toContain(`#value`);
          test.expect(clientJs).toContain(`#tramvaiValue`);
          test.expect(clientJs).not.toContain(`#focused`);
        });
      });

      test.describe('assets', () => {
        test.use({
          inputParameters: {
            name: 'assets',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should inline url for woff2 fonts', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverChunkJs = await fetchAssetByPattern(
            devServer.port,
            'assets',
            'fixtures_child-app_assets_index_ts_server.chunk',
            'server'
          );

          test.expect(serverChunkJs.includes('CascadiaCodePL.woff2')).toBeTruthy();
        });

        test('should inline svg import', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverChunkJs = await fetchAssetByPattern(
            devServer.port,
            'assets',
            'fixtures_child-app_assets_index_ts_server.chunk',
            'server'
          );

          test.expect(serverChunkJs).toContain('<svg xmlns=');
        });

        test('should support svgr and inline React components from .svg?react import', async ({
          devServer,
        }) => {
          await devServer.buildPromise;

          const serverChunkJs = await fetchAssetByPattern(
            devServer.port,
            'assets',
            'fixtures_child-app_assets_index_ts_server.chunk',
            'server'
          );
          const clientChunkJs = await fetchAssetByPattern(
            devServer.port,
            'assets',
            'fixtures_child-app_assets_index_ts_client.chunk'
          );

          test.expect(serverChunkJs).toContain('SvgPlus');
          test.expect(clientChunkJs).toContain('SvgPlus');
          test.expect(serverChunkJs).toContain('"data-qa-file": "plus"');
          test.expect(clientChunkJs).toContain('"data-qa-file": "plus"');
        });
      });

      test.describe('css', () => {
        test.use({
          inputParameters: {
            name: 'css',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should process CSS Modules and emit css chunks for client build', async ({
          devServer,
        }) => {
          await devServer.buildPromise;

          const clientChunkJs = await fetchAssetByPattern(
            devServer.port,
            'css',
            'fixtures_child-app_css_index_ts_client.chunk'
          );
          const clientCss = await (
            await fetch(`http://localhost:${devServer.port}/css/css@${version}.css`)
          ).text();

          test.expect(clientChunkJs).toContain('style--module__header_');
          test.expect(clientCss).toContain('style--module__header_');
          test.expect(clientCss).toContain('color: red;');
          test.expect(clientCss).not.toContain('-webkit-user-select: none;');
          test.expect(clientCss).toContain('padding: 8px;');
        });

        test('should process CSS Modules for server build', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverChunkJs = await fetchAssetByPattern(
            devServer.port,
            'css',
            'fixtures_child-app_css_index_ts_server.chunk',
            'server'
          );

          test.expect(serverChunkJs).toContain('style--module__header_');
        });
      });

      test.describe('PostCSS', () => {
        test.use({
          inputParameters: {
            name: 'postcss',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should respect postcss.config.js for client build', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientCss = await (
            await fetch(`http://localhost:${devServer.port}/postcss/postcss@${version}.css`)
          ).text();

          test.expect(clientCss).toContain('-webkit-user-select: none;');
          test.expect(clientCss).toContain('padding: 8px;');
        });
      });

      test.describe('define', () => {
        test.use({
          inputParameters: {
            name: 'define',
            rootDir: testSuiteFolder,
            fileCache: false,
            noRebuild: true,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should replace constants in client build', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientChunkJs = await fetchAssetByPattern(
            devServer.port,
            'define',
            'fixtures_child-app_define_index_ts_client.chunk'
          );

          test.expect(clientChunkJs).toContain('isBrowser ${true}');
          test.expect(clientChunkJs).toContain('isServer ${false}');
          test.expect(clientChunkJs).toContain('typeof window ${"object"}');
        });

        test('should replace constants in server build', async ({ devServer }) => {
          await devServer.buildPromise;

          const serverChunkJs = await fetchAssetByPattern(
            devServer.port,
            'define',
            'fixtures_child-app_define_index_ts_server.chunk',
            'server'
          );

          test.expect(serverChunkJs).toContain('isBrowser ${false}');
          test.expect(serverChunkJs).toContain('isServer ${true}');
          test.expect(serverChunkJs).toContain('typeof window ${"undefined"');
        });
      });

      test.describe('HMR', () => {
        const refreshPath = path.join(fixturesFolder, 'child-app', 'hot', 'app.ts');
        const initialContent = `export const app = 'hello world';`;
        const updatedContent = `export const app = 'super hello world';`;
        const outputPromise = outputFile(refreshPath, initialContent);

        test.use({
          inputParameters: {
            name: 'hot',
            rootDir: testSuiteFolder,
            noClientRebuild: false,
            fileCache: false,
          },
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should generate hmr runtime', async ({ devServer }) => {
          await devServer.buildPromise;

          const clientJs = await (
            await fetch(`http://localhost:${devServer.port}/hot/hot_client@${version}.js`)
          ).text();

          // HMR runtime
          test.expect(clientJs).toContain(`node_modules/webpack/hot/dev-server.js`);
          // ReactRefresh
          test
            .expect(clientJs)
            .toContain(
              `node_modules/@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js`
            );
        });

        test('should apply change without reload', async ({ page, devServer }) => {
          await outputPromise;
          await devServer.buildPromise;

          const http = require('http');

          const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });

            res.end(
              `<!DOCTYPE html>
<html>
  <head>
    <script src="http://localhost:${devServer.port}/hot/hot_client@${version}.js"></script>
    <script>
      (async () => {
        const childAppId = 'child-app__http://localhost:${devServer.port}/hot/hot_client@${version}.js';
        globalThis[childAppId].init({});
        const entry = await globalThis[childAppId].get('entry');
        entry();
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
            );
          });

          const port = 3000;

          await new Promise<void>((resolve) => {
            server.listen(port, () => {
              console.log(`SSR server running at http://localhost:${port}/`);
              resolve();
            });
          });

          await page.goto(`http://localhost:${port}`);

          test.expect(await page.locator('#root').textContent()).toEqual('hello world');

          await sleep(1000);
          await outputFile(refreshPath, updatedContent);
          await sleep(1000);

          test.expect(await page.locator('#root').textContent()).toEqual('super hello world');
        });
      });

      test.describe('ReactRefresh', () => {
        const refreshPath = path.join(fixturesFolder, 'child-app', 'refresh', 'App.tsx');
        const initialContent = `export const App = () => {
  return <div id="container">hello world</div>;
};
`;
        const updatedContent = `export const App = () => {
  return <div id="container">super hello world</div>;
};
`;
        const outputPromise = outputFile(refreshPath, initialContent);

        test.use({
          inputParameters: {
            name: 'refresh',
            rootDir: testSuiteFolder,
            noClientRebuild: false,
            fileCache: false,
          },
          extraInputParameters: [
            {
              name: 'application',
              rootDir: testSuiteFolder,
              noClientRebuild: false,
              fileCache: false,
            },
          ],
          extraConfiguration: {
            plugins,
            projects,
          },
        });

        test('should apply changes of react components without reload', async ({
          page,
          devServer,
          extraDevServers,
        }) => {
          await outputPromise;
          await devServer.buildPromise;

          const applicationServer = extraDevServers[0];
          await applicationServer.buildPromise;

          await page.pause();

          await page.goto(`http://localhost:${applicationServer.port}?port=${devServer.port}`);

          test.expect(await page.locator('#root').textContent()).toEqual('hello world');

          await sleep(1000);
          await outputFile(refreshPath, updatedContent);
          await sleep(1000);

          test.expect(await page.locator('#root').textContent()).toEqual('super hello world');
        });
      });

      // TODO: RuntimePathPlugin test
    });
  });
}
