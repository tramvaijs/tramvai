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
import { ApplicationConfigEntry } from '../../typings/configEntry/application';
import type { Params, Result } from './index';
import type { ConfigEntry } from '../../typings/configEntry/common';
import type { Config } from '../../typings/projectType';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

async function baseStartApplication(builder: 'webpack' | 'rspack', di: Container): Result {
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

function mapApplicationProjectToNewConfig(
  projectName: string,
  project: ConfigEntry,
  rootDir: string
) {
  const applicationProject = project as ApplicationConfigEntry;

  const mappedProject: ApplicationProject = {
    name: projectName,
    type: 'application',
    deprecatedLessSupport: true,
  };

  if (applicationProject.root) {
    mappedProject.sourceDir = applicationProject.root;
  }
  if (applicationProject.output) {
    mappedProject.output = {};

    if (applicationProject.output.server) {
      mappedProject.output.server = applicationProject.output.server;
    }
    if (applicationProject.output.client) {
      mappedProject.output.client = applicationProject.output.client;
    }
    if (applicationProject.output.static) {
      mappedProject.output.static = applicationProject.output.static;
    }
  }
  if (applicationProject.fileSystemPages) {
    mappedProject.fileSystemPages = applicationProject.fileSystemPages;
  }
  if (applicationProject.hotRefresh) {
    mappedProject.hotRefresh = applicationProject.hotRefresh;
  }
  if (applicationProject.sourceMap) {
    mappedProject.sourceMap = applicationProject.sourceMap;
  }
  if (applicationProject.experiments) {
    if (!mappedProject.experiments) {
      mappedProject.experiments = {};
    }
    if ('runtimeChunk' in applicationProject.experiments) {
      mappedProject.runtimeChunk = applicationProject.experiments.runtimeChunk;
    }
    if ('viewTransitions' in applicationProject.experiments) {
      mappedProject.experiments.viewTransitions = applicationProject.experiments.viewTransitions;
    }
    if ('reactTransitions' in applicationProject.experiments) {
      mappedProject.experiments.reactTransitions = applicationProject.experiments.reactTransitions;
    }
    if ('enableFillDeclareActionNamePlugin' in applicationProject.experiments) {
      mappedProject.enableFillDeclareActionNamePlugin =
        applicationProject.experiments.enableFillDeclareActionNamePlugin;
    }
    if ('autoResolveSharedRequiredVersions' in applicationProject.experiments) {
      if (!mappedProject.shared) {
        mappedProject.shared = {};
      }
      mappedProject.shared.autoResolveSharedRequiredVersions =
        applicationProject.experiments.autoResolveSharedRequiredVersions;
    }
    if (applicationProject.experiments.transpilation?.include) {
      const applicationProjectInclude = applicationProject.experiments.transpilation.include;
      mappedProject.transpilation = {
        include: {
          development:
            typeof applicationProjectInclude === 'string' ||
            Array.isArray(applicationProjectInclude)
              ? applicationProjectInclude
              : // @ts-ignore
                applicationProjectInclude.development,
        },
      };
    }
    if (applicationProject.experiments.pwa) {
      mappedProject.pwa = {
        workbox: {
          ...applicationProject.experiments.pwa.workbox,
          enabled:
            typeof applicationProject.experiments.pwa.workbox?.enabled === 'boolean'
              ? applicationProject.experiments.pwa.workbox.enabled
              : applicationProject.experiments.pwa.workbox?.enabled.development,
        },
        sw: applicationProject.experiments.pwa.sw,
        webmanifest: applicationProject.experiments.pwa.webmanifest,
        icon: applicationProject.experiments.pwa.icon,
        meta: applicationProject.experiments.pwa.meta,
      };
    }
  }
  if (applicationProject.serverApiDir) {
    mappedProject.fileSystemPapiDir = path.resolve(rootDir, applicationProject.serverApiDir);
  }
  if (applicationProject.define) {
    mappedProject.define = applicationProject.define;
  }
  if (applicationProject.shared) {
    mappedProject.shared = applicationProject.shared;
  }
  if (applicationProject.shared && 'flexibleTramvaiVersions' in applicationProject.shared) {
    if (!mappedProject.shared) {
      mappedProject.shared = {};
    }
    mappedProject.shared.autoResolveSharedRequiredVersions =
      applicationProject.shared.flexibleTramvaiVersions;
  }
  if (applicationProject.postcss) {
    mappedProject.postcss = applicationProject.postcss;

    if (mappedProject.postcss.config) {
      // TODO file outside src dir
      if (mappedProject.postcss.config.startsWith(applicationProject.root)) {
        mappedProject.postcss.config = mappedProject.postcss.config.replace(
          `${applicationProject.root}/`,
          ''
        );
      } else if (mappedProject.postcss.config.startsWith('./')) {
        mappedProject.postcss.config = path.resolve(mappedProject.postcss.config);
      }
    }
  }
  if (applicationProject.polyfill) {
    try {
      const resolvedPath = require.resolve(applicationProject.polyfill);
      if (resolvedPath.includes('node_modules')) {
        mappedProject.polyfill = resolvedPath;
      } else {
        mappedProject.polyfill = path.resolve(rootDir, applicationProject.polyfill);
      }
    } catch (e) {
      mappedProject.polyfill = path.resolve(rootDir, applicationProject.polyfill);
    }
  }
  if (applicationProject.modernPolyfill) {
    try {
      const resolvedPath = require.resolve(applicationProject.modernPolyfill);
      if (resolvedPath.includes('node_modules')) {
        mappedProject.modernPolyfill = resolvedPath;
      } else {
        mappedProject.modernPolyfill = path.resolve(rootDir, applicationProject.modernPolyfill);
      }
    } catch (e) {
      mappedProject.modernPolyfill = path.resolve(rootDir, applicationProject.modernPolyfill);
    }
  }
  if (applicationProject.dedupe) {
    mappedProject.dedupe = applicationProject.dedupe;
  }
  if ('integrity' in applicationProject) {
    mappedProject.integrity = applicationProject.integrity;
  }
  if (
    applicationProject.splitChunks &&
    (applicationProject.splitChunks.mode === 'granularChunks' ||
      applicationProject.splitChunks.mode === false)
  ) {
    // @ts-expect-error `commonChunk` is not supported in new cli
    mappedProject.splitChunks = applicationProject.splitChunks;
  }
  if (applicationProject.webpack?.resolveAlias) {
    if (!mappedProject.webpack) {
      mappedProject.webpack = {};
    }
    mappedProject.webpack.resolveAlias = applicationProject.webpack.resolveAlias;
  }
  if (applicationProject.webpack?.provide) {
    if (!mappedProject.webpack) {
      mappedProject.webpack = {};
    }
    mappedProject.webpack.provide = applicationProject.webpack.provide;
  }
  if (applicationProject.webpack?.watchOptions) {
    if (!mappedProject.webpack) {
      mappedProject.webpack = {};
    }
    mappedProject.webpack.watchOptions = applicationProject.webpack.watchOptions;
  }
  if (applicationProject.webpack?.writeToDisk) {
    mappedProject.writeToDisk = applicationProject.webpack.writeToDisk;
  }
  if (applicationProject.webpack && 'devtool' in applicationProject.webpack) {
    if (!mappedProject.webpack) {
      mappedProject.webpack = {};
    }
    mappedProject.webpack.devtool = applicationProject.webpack.devtool;
  }
  if (applicationProject.externals) {
    if (!mappedProject.webpack) {
      mappedProject.webpack = {};
    }
    mappedProject.webpack.externals = applicationProject.externals;
  }

  return mappedProject;
}
