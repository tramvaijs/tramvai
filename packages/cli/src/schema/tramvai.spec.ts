import Ajv from 'ajv';
import clone from '@tinkoff/utils/clone';
import { resolve } from 'path';
import { sync as requireResolve } from 'resolve';
import { schema } from './tramvai';

jest.mock('path');
jest.mock('resolve');

describe('JSON schema для tramvai.json', () => {
  it('Схема успешно компилируется', () => {
    const ajv = new Ajv({ strict: true, strictSchema: false, allowUnionTypes: true });

    expect(() => ajv.compile(schema)).not.toThrow();
  });

  it('Применяет значения по умолчанию', () => {
    (resolve as any).mockReturnValue('mock');
    (requireResolve as any).mockReturnValue('mock');

    const config = {
      projects: {
        app: {
          name: 'test-app',
          root: 'src/app',
          type: 'application' as const,
        },
        module: {
          name: 'test-module',
          root: 'src/module',
          type: 'module' as const,
        },
      },
    };

    const originalConfig = clone(config);

    const ajv = new Ajv({
      allErrors: true,
      useDefaults: true,
      strict: true,
      strictSchema: false,
      allowUnionTypes: true,
    });
    const validate = ajv.compile(schema);
    const valid = validate(config);

    expect(valid).toBe(true);
    expect(validate.errors).toBe(null);
    expect(config).not.toEqual(originalConfig);

    expect(config).toMatchInlineSnapshot(`
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
              "runtimeChunk": false,
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
            "root": "src/app",
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
          "module": {
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
            "name": "test-module",
            "notifications": {},
            "output": "dist/modules",
            "postcss": {
              "cssLocalIdentName": "[hash:base64:5]",
            },
            "root": "src/module",
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
            "type": "module",
            "webpack": {},
          },
        },
      }
    `);
  });
});
