import { ConfigManager } from './config';

const syncConfigFile = jest.fn();

it('should populate defaults for config', () => {
  const config: any = {
    projects: {
      app: {
        name: 'test-app',
        root: 'src',
        type: 'application',
      },
      'child-app': {
        name: 'test-child-app',
        root: 'packages/child-app',
        type: 'child-app',
      },
    },
  };

  const configManager = new ConfigManager({ config, syncConfigFile });

  expect(configManager.config).toMatchInlineSnapshot(`
    {
      "projects": {
        "app": {
          "checkAsyncTs": false,
          "cssMinimize": "css-minimizer",
          "dedupe": {
            "enabled": true,
            "enabledDev": false,
            "strategy": "equality",
          },
          "define": {
            "development": {},
            "production": {},
            "shared": {},
          },
          "enableFillActionNamePlugin": false,
          "experiments": {
            "autoResolveSharedRequiredVersions": false,
            "enableFillDeclareActionNamePlugin": false,
            "minicss": {
              "useImportModule": true,
            },
            "minifier": "terser",
            "pwa": {
              "icon": {
                "dest": "pwa-icons",
                "sizes": [
                  36,
                  48,
                  72,
                  96,
                  144,
                  192,
                  512,
                ],
              },
              "meta": {},
              "sw": {
                "dest": "sw.js",
                "scope": "/",
                "src": "sw.ts",
              },
              "webmanifest": {
                "dest": "/manifest.[hash].json",
                "enabled": false,
              },
              "workbox": {
                "enabled": false,
              },
            },
            "reactCompiler": false,
            "reactTransitions": false,
            "serverRunner": "thread",
            "transpilation": {
              "loader": "babel",
            },
            "viewTransitions": false,
            "webpack": {
              "backCompat": false,
              "cacheUnaffected": true,
            },
          },
          "externals": [],
          "fileSystemPages": {
            "enabled": false,
            "pagesDir": "pages",
            "rootErrorBoundaryPath": "error.tsx",
            "routesDir": "routes",
          },
          "generateDataQaTag": false,
          "hotRefresh": {
            "enabled": true,
            "options": {
              "overlay": false,
            },
          },
          "integrity": false,
          "name": "test-app",
          "notifications": {},
          "output": {
            "client": "dist/client",
            "server": "dist/server",
            "static": "dist/static",
          },
          "postcss": {},
          "root": "src",
          "serverApiDir": "src/api",
          "shared": {
            "criticalChunks": [],
            "deps": [],
            "flexibleTramvaiVersions": true,
          },
          "sourceMap": false,
          "splitChunks": {
            "commonChunkSplitNumber": 3,
            "frameworkChunk": false,
            "granularChunksMinSize": 20000,
            "granularChunksSplitNumber": 2,
            "mode": "granularChunks",
          },
          "terser": {
            "parallel": true,
          },
          "transpileOnlyModernLibs": true,
          "type": "application",
          "webpack": {},
          "withModulesStats": false,
        },
        "child-app": {
          "cssMinimize": "css-minimizer",
          "dedupe": {
            "enabled": true,
            "enabledDev": false,
            "strategy": "equality",
          },
          "define": {
            "development": {},
            "production": {},
            "shared": {},
          },
          "enableFillActionNamePlugin": false,
          "experiments": {
            "autoResolveSharedRequiredVersions": false,
            "enableFillDeclareActionNamePlugin": false,
            "minicss": {
              "useImportModule": true,
            },
            "minifier": "terser",
            "reactCompiler": false,
            "transpilation": {
              "loader": "babel",
            },
            "webpack": {
              "backCompat": false,
              "cacheUnaffected": true,
            },
          },
          "generateDataQaTag": false,
          "hotRefresh": {
            "enabled": true,
            "options": {
              "overlay": false,
            },
          },
          "integrity": false,
          "name": "test-child-app",
          "notifications": {},
          "output": "dist/child-app",
          "postcss": {
            "cssLocalIdentName": "[hash:base64:5]",
          },
          "root": "packages/child-app",
          "shared": {
            "criticalChunks": [],
            "deps": [],
            "flexibleTramvaiVersions": true,
          },
          "sourceMap": false,
          "terser": {
            "parallel": true,
          },
          "transpileOnlyModernLibs": true,
          "type": "child-app",
          "webpack": {},
        },
      },
    }
  `);
});

it('should populate defaults for overridable options', () => {
  const config: any = {
    projects: {
      app: {
        name: 'test-app',
        root: 'src',
        type: 'application',
        output: {
          client: 'assets/compiled',
        },
        sourceMap: false,
        webpack: { devtool: 'eval-source-map' },
        externals: ['test'],
        fileSystemPages: { enabled: true },
        experiments: {
          webpack: {
            backCompat: true,
          },
          transpilation: {
            loader: {
              development: 'swc',
            },
          },
        },
        dedupe: {
          strategy: 'semver',
        },
        define: {
          shared: {
            'process.env.APP_ID': 'app',
          },
        },
        svgo: {
          plugins: [
            {
              name: 'test-plugin',
            },
          ],
        },
      },
      'child-app': {
        name: 'test-child-app',
        root: 'packages/child-app',
        type: 'child-app',
        sourceMap: {
          development: true,
        },
        experiments: {
          transpilation: {
            loader: {},
          },
        },
        define: {
          shared: {
            commonProp: 'unknown',
          },
          production: {
            'process.env.PROD': 'true',
          },
        },
        webpack: {
          resolveAlias: {
            stream: 'browser-stream',
          },
          provide: {
            Buffer: ['buffer', 'Buffer'],
          },
          devtool: 'eval-source-map',
        },
      },
    },
  };

  const configManager = new ConfigManager({ config, syncConfigFile });

  expect(configManager.config).toMatchInlineSnapshot(`
    {
      "projects": {
        "app": {
          "checkAsyncTs": false,
          "cssMinimize": "css-minimizer",
          "dedupe": {
            "enabled": true,
            "enabledDev": false,
            "strategy": "semver",
          },
          "define": {
            "development": {},
            "production": {},
            "shared": {
              "process.env.APP_ID": "app",
            },
          },
          "enableFillActionNamePlugin": false,
          "experiments": {
            "autoResolveSharedRequiredVersions": false,
            "enableFillDeclareActionNamePlugin": false,
            "minicss": {
              "useImportModule": true,
            },
            "minifier": "terser",
            "pwa": {
              "icon": {
                "dest": "pwa-icons",
                "sizes": [
                  36,
                  48,
                  72,
                  96,
                  144,
                  192,
                  512,
                ],
              },
              "meta": {},
              "sw": {
                "dest": "sw.js",
                "scope": "/",
                "src": "sw.ts",
              },
              "webmanifest": {
                "dest": "/manifest.[hash].json",
                "enabled": false,
              },
              "workbox": {
                "enabled": false,
              },
            },
            "reactCompiler": false,
            "reactTransitions": false,
            "serverRunner": "thread",
            "transpilation": {
              "loader": {
                "development": "swc",
                "production": "babel",
              },
            },
            "viewTransitions": false,
            "webpack": {
              "backCompat": true,
              "cacheUnaffected": true,
            },
          },
          "externals": [
            "test",
          ],
          "fileSystemPages": {
            "enabled": true,
            "pagesDir": "pages",
            "rootErrorBoundaryPath": "error.tsx",
            "routesDir": "routes",
          },
          "generateDataQaTag": false,
          "hotRefresh": {
            "enabled": true,
            "options": {
              "overlay": false,
            },
          },
          "integrity": false,
          "name": "test-app",
          "notifications": {},
          "output": {
            "client": "assets/compiled",
            "server": "dist/server",
            "static": "dist/static",
          },
          "postcss": {},
          "root": "src",
          "serverApiDir": "src/api",
          "shared": {
            "criticalChunks": [],
            "deps": [],
            "flexibleTramvaiVersions": true,
          },
          "sourceMap": false,
          "splitChunks": {
            "commonChunkSplitNumber": 3,
            "frameworkChunk": false,
            "granularChunksMinSize": 20000,
            "granularChunksSplitNumber": 2,
            "mode": "granularChunks",
          },
          "svgo": {
            "plugins": [
              {
                "name": "test-plugin",
              },
            ],
          },
          "terser": {
            "parallel": true,
          },
          "transpileOnlyModernLibs": true,
          "type": "application",
          "webpack": {
            "devtool": "eval-source-map",
          },
          "withModulesStats": false,
        },
        "child-app": {
          "cssMinimize": "css-minimizer",
          "dedupe": {
            "enabled": true,
            "enabledDev": false,
            "strategy": "equality",
          },
          "define": {
            "development": {},
            "production": {
              "process.env.PROD": "true",
            },
            "shared": {
              "commonProp": "unknown",
            },
          },
          "enableFillActionNamePlugin": false,
          "experiments": {
            "autoResolveSharedRequiredVersions": false,
            "enableFillDeclareActionNamePlugin": false,
            "minicss": {
              "useImportModule": true,
            },
            "minifier": "terser",
            "reactCompiler": false,
            "transpilation": {
              "loader": {
                "development": "babel",
                "production": "babel",
              },
            },
            "webpack": {
              "backCompat": false,
              "cacheUnaffected": true,
            },
          },
          "generateDataQaTag": false,
          "hotRefresh": {
            "enabled": true,
            "options": {
              "overlay": false,
            },
          },
          "integrity": false,
          "name": "test-child-app",
          "notifications": {},
          "output": "dist/child-app",
          "postcss": {
            "cssLocalIdentName": "[hash:base64:5]",
          },
          "root": "packages/child-app",
          "shared": {
            "criticalChunks": [],
            "deps": [],
            "flexibleTramvaiVersions": true,
          },
          "sourceMap": {
            "development": true,
            "production": false,
          },
          "terser": {
            "parallel": true,
          },
          "transpileOnlyModernLibs": true,
          "type": "child-app",
          "webpack": {
            "devtool": "eval-source-map",
            "provide": {
              "Buffer": [
                "buffer",
                "Buffer",
              ],
            },
            "resolveAlias": {
              "stream": "browser-stream",
            },
          },
        },
      },
    }
  `);
});

it('should throw an error if added aditional unknown property', () => {
  const config: any = {
    projects: {
      app: {
        unknownOption: 'something',
        name: 'test-app',
        root: 'src',
        type: 'application',
        output: {
          client: 'assets/compiled',
        },
        sourceMap: false,
        externals: ['test'],
        fileSystemPages: { enabled: true },
        experiments: {
          webpack: {
            backCompat: true,
          },
          transpilation: {
            loader: {
              development: 'swc',
            },
          },
        },
        dedupe: {
          strategy: 'semver',
        },
        define: {
          shared: {
            'process.env.APP_ID': 'app',
          },
        },
        svgo: {
          plugins: [
            {
              name: 'test-plugin',
            },
          ],
        },
      },
      'child-app': {
        name: 'test-child-app',
        root: 'packages/child-app',
        type: 'child-app',
        sourceMap: {
          development: true,
        },
        experiments: {
          transpilation: {
            loader: {},
          },
        },
        define: {
          shared: {
            commonProp: 'unknown',
          },
          production: {
            'process.env.PROD': 'true',
          },
        },
        webpack: {
          resolveAlias: {
            stream: 'browser-stream',
          },
          provide: {
            Buffer: ['buffer', 'Buffer'],
          },
        },
      },
    },
  };

  expect.assertions(2);
  try {
    const configManager = new ConfigManager({ config, syncConfigFile });
  } catch (e: any) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(e.message).toMatch('Config validation failed');
    // eslint-disable-next-line jest/no-conditional-expect
    expect(true).toBeTruthy();
  }
});
