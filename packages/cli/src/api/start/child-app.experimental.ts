/* eslint-disable complexity, max-statements */
import path from 'node:path';
import type { Container } from '@tinkoff/dippy';
import { start } from '@tramvai/api/lib/api/start';
import type { ChildAppProject, Configuration, Project } from '@tramvai/api/lib/config';
import {
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_ENTRY_TOKEN,
  CONFIG_ROOT_DIR_TOKEN,
} from '../../di/tokens';
import { getTramvaiConfig } from '../../utils/getTramvaiConfig';
import type { Params, Result } from './index';
import type { ConfigEntry } from '../../typings/configEntry/common';
import type { Config } from '../../typings/projectType';
import type { ChildAppConfigEntry } from '../../typings/configEntry/child-app';
import type { Experiments } from '../../typings/configEntry/cli';
import { createDevServerApi, getInputParams, hasSwcTranspiler } from './utils/config';

// -- Exhaustive field manifests --
// When a new field is added to ChildAppConfigEntry or Experiments,
// TypeScript will error here until the field is explicitly listed as 'mapped' or 'skipped'.

export const CHILD_APP_CONFIG_FIELDS = {
  // ConfigEntry
  name: 'skipped',
  root: 'mapped',
  type: 'skipped',

  // CliConfigEntry
  sourceMap: 'mapped',
  // Integrity not implemented for ChildApps
  integrity: 'skipped',
  experiments: 'mapped',
  // Deprecated
  excludesPresetEnv: 'skipped',
  // Deprecated
  threadLoader: 'skipped',
  define: 'mapped',
  generateDataQaTag: 'mapped',
  // Deprecated
  enableFillActionNamePlugin: 'skipped',
  postcss: 'mapped',
  // Deprecated
  alias: 'skipped',
  svgo: 'mapped',
  imageOptimization: 'mapped',
  webpack: 'mapped',
  dedupe: 'mapped',
  // Deprecated
  terser: 'skipped',
  // Deprecated
  cssMinimize: 'skipped',
  hotRefresh: 'mapped',
  liveReload: 'mapped',
  // Deprecated
  notifications: 'skipped',
  shared: 'mapped',

  // ChildAppConfigEntry
  output: 'mapped',
} as const satisfies Record<keyof ChildAppConfigEntry, 'mapped' | 'skipped'>;

export const CHILD_APP_EXPERIMENTS_FIELDS = {
  // Deprecated
  webpack: 'skipped',
  // Deprecated
  minicss: 'skipped',
  lightningcss: 'mapped',
  transpilation: 'mapped',
  // TODO: map with build scenario
  minifier: 'skipped',
  autoResolveSharedRequiredVersions: 'mapped',
  enableFillDeclareActionNamePlugin: 'mapped',
  reactCompiler: 'mapped',
} as const satisfies Record<keyof Experiments, 'mapped' | 'skipped'>;

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

export const startExperimentalChildApp = async (di: Container): Result => {
  const configEntry = di.get(CONFIG_ENTRY_TOKEN);
  const options = di.get(COMMAND_PARAMETERS_TOKEN as Params);
  const rootDir = di.get(CONFIG_ROOT_DIR_TOKEN);

  const inputParameters = getInputParams(configEntry, options, rootDir);

  let content: Config | undefined;
  let projects: Record<string, Project> = {};

  if ('config' in options) {
    const { config } = options;
    content = {
      projects: {
        [config.name]: config,
      },
    };
    projects[config.name] = mapChildAppProjectToNewConfig(config.name, config);
  } else {
    ({ content, projects } = mapTramvaiJsonToNewTsConfig({ rootDir }));
  }

  const extraConfiguration: Partial<Configuration> = {
    projects,
    plugins: [
      '@tramvai/plugin-webpack-builder',
      hasSwcTranspiler(content)
        ? '@tramvai/plugin-swc-transpiler'
        : '@tramvai/plugin-babel-transpiler',
    ].filter(Boolean),
  };

  const devServer = await start(inputParameters, extraConfiguration);

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
  }

  return createDevServerApi(devServer);
};

function mapTramvaiJsonToNewTsConfig({ rootDir }: { rootDir: string }) {
  const { content } = getTramvaiConfig(rootDir);
  const projects: Configuration['projects'] = {};

  for (const projectName in content.projects) {
    const project = content.projects[projectName];

    if (project.type === 'child-app') {
      projects[projectName] = mapChildAppProjectToNewConfig(projectName, project);
    }
  }

  return { content, projects };
}

export function mapChildAppProjectToNewConfig(projectName: string, project: ConfigEntry) {
  const src = project as ChildAppConfigEntry;
  const result: ChildAppProject = {
    name: projectName,
    type: 'child-app',
    deprecatedLessSupport: true,
  };

  for (const key of Object.keys(src) as Array<keyof ChildAppConfigEntry>) {
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
          result.output = src.output;
        }
        break;

      case 'sourceMap':
        if (src.sourceMap) {
          result.sourceMap = src.sourceMap;
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
          mapChildAppExperimentFields(src.experiments, result);
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

      case 'define':
        if (src.define) {
          result.define = src.define;
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

      case 'dedupe':
        if (src.dedupe) {
          result.dedupe = src.dedupe;
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

      // Intentionally not mapped to the new config
      case 'integrity':
      case 'alias':
      case 'enableFillActionNamePlugin':
      case 'excludesPresetEnv':
      case 'threadLoader':
      case 'terser':
      case 'cssMinimize':
      case 'notifications':
        break;

      default: {
        const _exhaustiveCheck: never = key;
        throw new Error(`Unhandled child-app config field: ${_exhaustiveCheck}`);
      }
    }
  }

  return result;
}

function mapChildAppExperimentFields(src: Experiments, result: ChildAppProject): void {
  for (const key of Object.keys(src) as Array<keyof Experiments>) {
    // eslint-disable-next-line default-case
    switch (key) {
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

      case 'reactCompiler':
        result.experiments!.reactCompiler = src.reactCompiler;
        break;

      case 'lightningcss':
        result.experiments!.lightningcss = src.lightningcss;
        break;

      // Intentionally not mapped to the new config
      case 'webpack':
      case 'minicss':
      case 'minifier':
        break;

      default: {
        const _exhaustiveCheck: never = key;
        throw new Error(`Unhandled child-app experiment field: ${_exhaustiveCheck}`);
      }
    }
  }
}
