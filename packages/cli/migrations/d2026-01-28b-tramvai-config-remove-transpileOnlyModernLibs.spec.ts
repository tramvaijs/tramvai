import { createApi } from '@tramvai/tools-migrate/lib/testUtils';

import migration from './d2026-01-28b-tramvai-config-remove-transpileOnlyModernLibs';

describe('migrations/packages/cli/d2025-04-11b-tramvai-config-remove-modern', () => {
  const defaultApi = createApi({
    tramvaiJSON: {
      source: {
        projects: {
          invest: {
            name: 'invest',
            root: 'src',
            type: 'application',
            transpileOnlyModernLibs: true,
            polyfill: './polyfill.ts',
          },
        },
      },
      path: '/tramvai.json',
    },
  });

  const apiWithEnabledTranspilation = createApi({
    tramvaiJSON: {
      source: {
        projects: {
          invest: {
            name: 'invest',
            root: 'src',
            type: 'application',
            transpileOnlyModernLibs: false,
            polyfill: './polyfill.ts',
            experiments: {
              transpilation: {
                loader: 'swc',
              },
            },
          },
        },
      },
      path: '/tramvai.json',
    },
  });

  const apiWithEnabledTranspilationAndEmptyExperiments = createApi({
    tramvaiJSON: {
      source: {
        projects: {
          invest: {
            name: 'invest',
            root: 'src',
            type: 'application',
            transpileOnlyModernLibs: false,
            polyfill: './polyfill.ts',
          },
        },
      },
      path: '/tramvai.json',
    },
  });

  it('should remove transpileOnlyModernLibs field', async () => {
    await migration(defaultApi);

    expect(JSON.stringify(defaultApi.tramvaiJSON.source, null, 2)).toMatchInlineSnapshot(`
      "{
        "projects": {
          "invest": {
            "name": "invest",
            "root": "src",
            "type": "application",
            "polyfill": "./polyfill.ts"
          }
        }
      }"
    `);
  });

  it('should remove transpileOnlyModernLibs field and add include', async () => {
    await migration(apiWithEnabledTranspilation);

    expect(JSON.stringify(apiWithEnabledTranspilation.tramvaiJSON.source, null, 2))
      .toMatchInlineSnapshot(`
      "{
        "projects": {
          "invest": {
            "name": "invest",
            "root": "src",
            "type": "application",
            "polyfill": "./polyfill.ts",
            "experiments": {
              "transpilation": {
                "loader": "swc",
                "include": "all"
              }
            }
          }
        }
      }"
    `);
  });

  it('should remove transpileOnlyModernLibs field and add include with no experiments', async () => {
    await migration(apiWithEnabledTranspilationAndEmptyExperiments);

    expect(
      JSON.stringify(apiWithEnabledTranspilationAndEmptyExperiments.tramvaiJSON.source, null, 2)
    ).toMatchInlineSnapshot(`
      "{
        "projects": {
          "invest": {
            "name": "invest",
            "root": "src",
            "type": "application",
            "polyfill": "./polyfill.ts",
            "experiments": {
              "transpilation": {
                "include": "all"
              }
            }
          }
        }
      }"
    `);
  });
});
