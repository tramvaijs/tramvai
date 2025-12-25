import path from 'node:path';
import type { Container } from '@tinkoff/dippy';
import { StartParameters, start } from '@tramvai/api/lib/api/start';
import { ApplicationProject, Configuration } from '@tramvai/api/lib/config';
import {
  COMMAND_PARAMETERS_TOKEN,
  CONFIG_ENTRY_TOKEN,
  CONFIG_ROOT_DIR_TOKEN,
} from '../../di/tokens';
import { getTramvaiConfig } from '../../utils/getTramvaiConfig';
import { ApplicationConfigEntry } from '../../typings/configEntry/application';
import type { Params, Result } from './index';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

export const startApplicationExperimental = async (di: Container): Result => {
  const configEntry = di.get(CONFIG_ENTRY_TOKEN);
  const options = di.get(COMMAND_PARAMETERS_TOKEN as Params);
  const rootDir = di.get(CONFIG_ROOT_DIR_TOKEN);

  const inputParameters: StartParameters = {
    name: configEntry.name,
    mode: 'development',
    benchmark: options.benchmark,
    buildType: options.buildType,
    analyze: options.analyze,
    port: options.port,
    host: options.host,
    staticPort: options.staticPort,
    staticHost: options.staticHost,
    noServerRebuild: options.noServerRebuild,
    noClientRebuild: options.noClientRebuild,
    resolveSymlinks: options.resolveSymlinks,
    fileCache: options.fileCache,
    showProgress: true,
    verboseLogging: options.verboseWebpack,
  };

  const { content, projects } = mapTramvaiJsonToNewTsConfig({ rootDir });

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
      '@tramvai/plugin-webpack-builder',
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
      name: '@tramvai/plugin-webpack-builder',
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
};

/**
 * Mapping from tramvai.json config format to new tramvai.config.ts,
 * for seamless migration
 */
// eslint-disable-next-line max-statements, complexity
function mapTramvaiJsonToNewTsConfig({ rootDir }: { rootDir: string }) {
  const { content } = getTramvaiConfig(rootDir);
  const projects: Configuration['projects'] = {};

  for (const projectName in content.projects) {
    const project = content.projects[projectName];

    if (project.type === 'application') {
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
      if (applicationProject.experiments && 'runtimeChunk' in applicationProject.experiments) {
        mappedProject.runtimeChunk = applicationProject.experiments.runtimeChunk;
      }
      if (applicationProject.experiments && 'viewTransitions' in applicationProject.experiments) {
        mappedProject.experiments.viewTransitions = applicationProject.experiments.viewTransitions;
      }
      if (applicationProject.experiments && 'reactTransitions' in applicationProject.experiments) {
        mappedProject.experiments.reactTransitions =
          applicationProject.experiments.reactTransitions;
      }
      if (
        applicationProject.experiments &&
        'enableFillDeclareActionNamePlugin' in applicationProject.experiments
      ) {
        mappedProject.enableFillDeclareActionNamePlugin =
          applicationProject.experiments.enableFillDeclareActionNamePlugin;
      }
      if (applicationProject.serverApiDir) {
        mappedProject.fileSystemPapiDir = path.resolve(applicationProject.serverApiDir);
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
          if (require.resolve(applicationProject.polyfill).includes('node_modules')) {
            mappedProject.polyfill = require.resolve(applicationProject.polyfill);
          } else {
            mappedProject.polyfill = path.resolve(applicationProject.polyfill);
          }
        } catch (e) {
          mappedProject.polyfill = path.resolve(applicationProject.polyfill);
        }
      }
      if (applicationProject.modernPolyfill) {
        try {
          if (require.resolve(mappedProject.modernPolyfill).includes('node_modules')) {
            mappedProject.polyfill = require.resolve(applicationProject.modernPolyfill);
          } else {
            mappedProject.polyfill = path.resolve(applicationProject.modernPolyfill);
          }
        } catch (e) {
          mappedProject.polyfill = path.resolve(applicationProject.modernPolyfill);
        }
      }
      if (applicationProject.dedupe) {
        mappedProject.dedupe = applicationProject.dedupe;
      }
      if ('integrity' in applicationProject) {
        if (typeof applicationProject.integrity === 'boolean') {
          mappedProject.integrity = {
            enabled: applicationProject.integrity,
          };
        } else {
          // @ts-expect-error inconsistent `hashFuncNames` types
          mappedProject.integrity = applicationProject.integrity;
        }
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
      if (applicationProject.webpack && 'devtool' in applicationProject.webpack) {
        if (!mappedProject.webpack) {
          mappedProject.webpack = {};
        }
        mappedProject.webpack.devtool = applicationProject.webpack.devtool;
      }
      if (applicationProject.experiments?.transpilation) {
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
      if (applicationProject.experiments?.pwa) {
        mappedProject.pwa = {
          workbox: {
            ...applicationProject.experiments.pwa.workbox,
            enabled:
              typeof applicationProject.experiments.pwa.workbox.enabled === 'boolean'
                ? applicationProject.experiments.pwa.workbox.enabled
                : applicationProject.experiments.pwa.workbox.enabled.development,
          },
          sw: applicationProject.experiments.pwa.sw,
          webmanifest: applicationProject.experiments.pwa.webmanifest,
          icon: applicationProject.experiments.pwa.icon,
          meta: applicationProject.experiments.pwa.meta,
        };
      }
      if (applicationProject.externals) {
        if (!mappedProject.webpack) {
          mappedProject.webpack = {};
        }
        mappedProject.webpack.externals = applicationProject.externals;
      }

      projects[projectName] = mappedProject;
    }
  }

  return { content, projects };
}
