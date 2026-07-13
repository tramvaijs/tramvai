/* eslint-disable complexity, max-statements */
import path from 'node:path';
import type { Container } from '@tinkoff/dippy';
import { StartParameters, start } from '@tramvai/api/lib/api/start';
import { ApplicationProject, Configuration, Project } from '@tramvai/api/lib/config';
import {
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_ENTRY_TOKEN,
  CONFIG_ROOT_DIR_TOKEN,
} from '../../di/tokens';
import { getTramvaiConfig } from '../../utils/getTramvaiConfig';
import type { Params, Result } from './index';
import type { ConfigEntry } from '../../typings/configEntry/common';
import type { Config } from '../../typings/projectType';
import type {
  ApplicationConfigEntry,
  ApplicationExperiments,
} from '../../typings/configEntry/application';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

// -- Exhaustive field manifests --
// When a new field is added to ApplicationConfigEntry or ApplicationExperiments,
// TypeScript will error here until the field is explicitly listed as 'mapped' or 'skipped'.

export const APPLICATION_CONFIG_FIELDS = {
  // ConfigEntry
  name: 'skipped',
  root: 'mapped',
  type: 'skipped',

  // CliConfigEntry
  sourceMap: 'mapped',
  integrity: 'mapped',
  experiments: 'mapped',
  excludesPresetEnv: 'skipped',
  threadLoader: 'skipped',
  define: 'mapped',
  generateDataQaTag: 'mapped',
  enableFillActionNamePlugin: 'skipped',
  postcss: 'mapped',
  alias: 'skipped',
  svgo: 'mapped',
  imageOptimization: 'mapped',
  webpack: 'mapped',
  dedupe: 'mapped',
  terser: 'skipped',
  cssMinimize: 'skipped',
  hotRefresh: 'mapped',
  liveReload: 'mapped',
  notifications: 'skipped',
  transpileOnlyModernLibs: 'skipped',
  shared: 'mapped',

  // ApplicationConfigEntry
  polyfill: 'mapped',
  modernPolyfill: 'mapped',
  serverApiDir: 'mapped',
  output: 'mapped',
  fileSystemPages: 'mapped',
  splitChunks: 'mapped',
  checkAsyncTs: 'skipped',
  externals: 'mapped',
  withModulesStats: 'skipped',
} as const satisfies Record<keyof ApplicationConfigEntry, 'mapped' | 'skipped'>;

export const APPLICATION_EXPERIMENTS_FIELDS = {
  // Experiments
  webpack: 'skipped',
  minicss: 'skipped',
  lightningcss: 'mapped',
  transpilation: 'mapped',
  minifier: 'skipped',
  autoResolveSharedRequiredVersions: 'mapped',
  enableFillDeclareActionNamePlugin: 'mapped',
  reactCompiler: 'mapped',

  // ApplicationExperiments
  serverRunner: 'skipped',
  pwa: 'mapped',
  viewTransitions: 'mapped',
  reactTransitions: 'mapped',
  runtimeChunk: 'mapped',
} as const satisfies Record<keyof ApplicationExperiments, 'mapped' | 'skipped'>;

export const startApplication = (di: Container) => {
  return baseStartApplication('webpack', di);
};

export const startExperimentalApplication = (di: Container) => {
  return baseStartApplication('rspack', di);
};

async function baseStartApplication(builder: 'rspack' | 'webpack', di: Container): Result {
  const configEntry = di.get(CONFIG_ENTRY_TOKEN);
  const options = di.get(COMMAND_PARAMETERS_TOKEN as Params);
  const rootDir = di.get(CONFIG_ROOT_DIR_TOKEN);

  const inputParameters: StartParameters = {
    name: configEntry.name,
    mode: 'development',
    benchmark: options.benchmark,
    buildType: options.buildType,
    noRebuild: options.noRebuild,
    debug: options.debug ? String(options.debug) : false,
    https: options.https,
    httpsCert: options.httpsCert,
    httpsKey: options.httpsKey,
    runtimeEnv: options.env,
    analyze: options.analyze,
    port: options.port,
    sourceMap: options.sourceMap,
    host: options.host ?? '0.0.0.0',
    serverHot: options.serverHot,
    rootDir,
    staticPort: options.staticPort,
    staticHost: options.staticHost,
    noServerRebuild: options.noServerRebuild,
    noClientRebuild: options.noClientRebuild,
    resolveSymlinks: options.resolveSymlinks,
    fileCache: options.fileCache,
    disableServerRunnerWaiting: options.disableServerRunnerWaiting,
    showProgress: options.showProgress ?? true,
    showBanner: options.showBanner ?? true,
    verboseLogging: options.verboseWebpack,
  };

  let content: Config | undefined;
  let projects: Record<string, Project> = {};

  if ('config' in options) {
    const { config } = options;
    content = {
      projects: {
        [config.name]: config,
      },
    };
    projects[config.name] = mapApplicationProjectToNewConfig(config.name, config, rootDir);
  } else {
    ({ content, projects } = mapTramvaiJsonToNewTsConfig({ rootDir }));
  }

  const hasSwcTranspiler = Object.values(content.projects).some((project) => {
    if (
      project.type !== 'application' ||
      !(project as ApplicationConfigEntry).experiments?.transpilation
    ) {
      return false;
    }
    const { loader } = (project as ApplicationConfigEntry).experiments.transpilation;

    if (typeof loader === 'string') {
      // @ts-expect-error
      return loader === 'swc';
    }
    // @ts-expect-error
    return loader.development === 'swc';
  });
  const hasPwa = Object.values(content.projects).some((project) => {
    if (project.type !== 'application' || !(project as ApplicationConfigEntry).experiments) {
      return false;
    }
    const { pwa } = (project as ApplicationConfigEntry).experiments;
    return !!pwa;
  });

  const extraConfiguration: Partial<Configuration> = {
    projects,
    plugins: [
      `@tramvai/plugin-${builder}-builder`,
      hasSwcTranspiler ? '@tramvai/plugin-swc-transpiler' : '@tramvai/plugin-babel-transpiler',
      hasPwa && '@tramvai/plugin-webpack-pwa',
    ].filter(Boolean),
  };

  const devServer = await start(inputParameters, extraConfiguration);

  // CLI will wait for this handlers before exiting
  // @reference `packages/cli/src/cli/runCLI.ts`
  if (!global.__TRAMVAI_EXIT_HANDLERS__) {
    global.__TRAMVAI_EXIT_HANDLERS__ = [];
  }

  global.__TRAMVAI_EXIT_HANDLERS__.push(async () => {
    await devServer?.close?.();
  });

  try {
    await devServer.buildPromise;
  } catch (e) {
    // some webpack build errors can be safely ignored
    // TODO: strictErrorHandle parameter? used in `packages/cli/src/library/swc/__integration__/swc.start.test.ts` for old cli
  }

  return {
    server: devServer.server,
    staticServer: devServer.staticServer,
    close: async () => {
      await devServer.close();
    },
    invalidate: async () => {
      await devServer.invalidate();
    },
    getBuildStats: () => {
      return devServer.getStats();
    },
    builder: {
      name: `@tramvai/plugin-${builder}-builder`,
      start: async (options) => {
        return {
          close: async () => {
            await devServer.close();
          },
          invalidate: async () => {
            await devServer.invalidate();
          },
          getBuildStats: () => {
            return devServer.getStats();
          },
        };
      },
      build: async (options) => {
        return {
          getBuildStats: () => {
            return {};
          },
        };
      },
      analyze: async (options) => {},
      on: (event, callback) => {
        // TODO useful events as public new devServer API
      },
    },
  };
}

export const startWebpackApplication = (di: Container) => {
  return baseStartApplication('webpack', di);
};

export const startRspackApplication = (di: Container) => {
  return baseStartApplication('rspack', di);
};

/**
 * Mapping from tramvai.json config format to new tramvai.config.ts,
 * for seamless migration
 */
function mapTramvaiJsonToNewTsConfig({ rootDir }: { rootDir: string }) {
  const { content } = getTramvaiConfig(rootDir);
  const projects: Configuration['projects'] = {};

  for (const projectName in content.projects) {
    const project = content.projects[projectName];

    if (project.type === 'application') {
      projects[projectName] = mapApplicationProjectToNewConfig(projectName, project, rootDir);
    }
  }

  return { content, projects };
}

export function mapApplicationProjectToNewConfig(
  projectName: string,
  project: ConfigEntry,
  rootDir: string
) {
  const src = project as ApplicationConfigEntry;
  const result: ApplicationProject = {
    name: projectName,
    type: 'application',
    deprecatedLessSupport: true,
  };

  for (const key of Object.keys(src) as Array<keyof ApplicationConfigEntry>) {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'name':
      case 'type':
        break;

      case 'root':
        if (src.root) {
          result.sourceDir = src.root;
        }
        break;

      case 'output':
        if (src.output) {
          result.output = {};
          if (src.output.server) result.output.server = src.output.server;
          if (src.output.client) result.output.client = src.output.client;
          if (src.output.static) result.output.static = src.output.static;
        }
        break;

      case 'sourceMap':
        if (src.sourceMap) {
          result.sourceMap = src.sourceMap;
        }
        break;

      case 'fileSystemPages':
        if (src.fileSystemPages) {
          result.fileSystemPages = src.fileSystemPages;
        }
        break;

      case 'hotRefresh':
        if (src.hotRefresh) {
          result.hotRefresh = src.hotRefresh;
        }
        break;

      case 'liveReload':
        result.liveReload = src.liveReload;
        break;

      case 'svgo':
        if (src.svgo) {
          // @ts-expect-error mismatch svgo.plugins type
          result.svgo = src.svgo;
        }
        break;

      case 'generateDataQaTag':
        result.generateDataQaTag = src.generateDataQaTag;
        break;

      case 'imageOptimization':
        if (src.imageOptimization) {
          result.imageOptimization = src.imageOptimization;
        }
        break;

      case 'experiments':
        if (src.experiments) {
          result.experiments = {};
          mapExperimentFields(src.experiments, result);
        }
        break;

      case 'serverApiDir':
        if (src.serverApiDir) {
          result.fileSystemPapiDir = path.resolve(rootDir, src.serverApiDir);
        }
        break;

      case 'define':
        if (src.define) {
          result.define = src.define;
        }
        break;

      case 'shared':
        if (src.shared) {
          result.shared = src.shared;
          if ('flexibleTramvaiVersions' in src.shared) {
            if (!result.shared) result.shared = {};
            result.shared.autoResolveSharedRequiredVersions = src.shared.flexibleTramvaiVersions;
          }
        }
        break;

      case 'postcss':
        if (src.postcss) {
          result.postcss = src.postcss;
          if (result.postcss.config) {
            if (result.postcss.config.startsWith(src.root)) {
              result.postcss.config = result.postcss.config.replace(`${src.root}/`, '');
            } else if (result.postcss.config.startsWith('./')) {
              result.postcss.config = path.resolve(result.postcss.config);
            }
          }
        }
        break;

      case 'polyfill':
        if (src.polyfill) {
          try {
            const resolvedPath = require.resolve(src.polyfill);
            result.polyfill = resolvedPath.includes('node_modules')
              ? resolvedPath
              : path.resolve(rootDir, src.polyfill);
          } catch (e) {
            result.polyfill = path.resolve(rootDir, src.polyfill);
          }
        }
        break;

      case 'modernPolyfill':
        if (src.modernPolyfill) {
          try {
            const resolvedPath = require.resolve(src.modernPolyfill);
            result.modernPolyfill = resolvedPath.includes('node_modules')
              ? resolvedPath
              : path.resolve(rootDir, src.modernPolyfill);
          } catch (e) {
            result.modernPolyfill = path.resolve(rootDir, src.modernPolyfill);
          }
        }
        break;

      case 'dedupe':
        if (src.dedupe) {
          result.dedupe = src.dedupe;
        }
        break;

      case 'integrity':
        result.integrity = src.integrity;
        break;

      case 'splitChunks':
        if (
          src.splitChunks &&
          (src.splitChunks.mode === 'granularChunks' || src.splitChunks.mode === false)
        ) {
          // @ts-expect-error `commonChunk` is not supported in new cli
          result.splitChunks = src.splitChunks;
        }
        break;

      case 'webpack':
        if (src.webpack?.resolveAlias) {
          if (!result.webpack) result.webpack = {};
          result.webpack.resolveAlias = src.webpack.resolveAlias;
        }
        if (src.webpack?.provide) {
          if (!result.webpack) result.webpack = {};
          result.webpack.provide = src.webpack.provide;
        }
        if (src.webpack?.watchOptions) {
          if (!result.webpack) result.webpack = {};
          result.webpack.watchOptions = src.webpack.watchOptions;
        }
        if (src.webpack?.writeToDisk) {
          result.writeToDisk = src.webpack.writeToDisk;
        }
        if (src.webpack && 'devtool' in src.webpack) {
          if (!result.webpack) result.webpack = {};
          result.webpack.devtool = src.webpack.devtool;
        }
        break;

      case 'externals':
        if (src.externals) {
          if (!result.webpack) result.webpack = {};
          result.webpack.externals = src.externals;
        }
        break;

      // Intentionally not mapped to the new config
      case 'checkAsyncTs':
      case 'withModulesStats':
      case 'excludesPresetEnv':
      case 'threadLoader':
      case 'enableFillActionNamePlugin':
      case 'alias':
      case 'terser':
      case 'cssMinimize':
      case 'transpileOnlyModernLibs':
      case 'notifications':
        break;

      default: {
        const _exhaustiveCheck: never = key;
        throw new Error(`Unhandled application config field: ${_exhaustiveCheck}`);
      }
    }
  }

  return result;
}

function mapExperimentFields(src: ApplicationExperiments, result: ApplicationProject): void {
  for (const key of Object.keys(src) as Array<keyof ApplicationExperiments>) {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'runtimeChunk':
        result.runtimeChunk = src.runtimeChunk;
        break;

      case 'viewTransitions':
        result.experiments!.viewTransitions = src.viewTransitions;
        break;

      case 'reactTransitions':
        result.experiments!.reactTransitions = src.reactTransitions;
        break;

      case 'lightningcss':
        result.experiments!.lightningcss = src.lightningcss;
        break;

      case 'reactCompiler':
        result.experiments!.reactCompiler = src.reactCompiler;
        break;

      case 'enableFillDeclareActionNamePlugin':
        result.enableFillDeclareActionNamePlugin = src.enableFillDeclareActionNamePlugin;
        break;

      case 'autoResolveSharedRequiredVersions':
        if (!result.shared) result.shared = {};
        result.shared.autoResolveSharedRequiredVersions = src.autoResolveSharedRequiredVersions;
        break;

      case 'transpilation':
        if (src.transpilation?.include) {
          const { include } = src.transpilation;
          result.transpilation = {
            include: {
              development:
                typeof include === 'string' || Array.isArray(include)
                  ? include
                  : // @ts-ignore
                    include.development,
            },
          };
        }
        break;

      case 'pwa':
        if (src.pwa) {
          result.pwa = {
            workbox: {
              ...src.pwa.workbox,
              enabled:
                typeof src.pwa.workbox?.enabled === 'boolean'
                  ? src.pwa.workbox.enabled
                  : src.pwa.workbox?.enabled.development,
            },
            sw: src.pwa.sw,
            webmanifest: src.pwa.webmanifest,
            icon: src.pwa.icon,
            meta: src.pwa.meta,
          };
        }
        break;

      // Intentionally not mapped to the new config
      case 'webpack':
      case 'minicss':
      case 'minifier':
      case 'serverRunner':
        break;

      default: {
        const _exhaustiveCheck: never = key;
        throw new Error(`Unhandled experiment config field: ${_exhaustiveCheck}`);
      }
    }
  }
}
