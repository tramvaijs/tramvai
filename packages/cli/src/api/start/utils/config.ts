import { StartParameters } from '@tramvai/api/src/api/start';

import { ConfigEntry } from '../../../typings/configEntry/common';
import type { Params } from '../index';
import type { Config } from '../../../typings/projectType';
import { ApplicationConfigEntry } from '../../../typings/configEntry/application';

export function getInputParams(
  config: ConfigEntry,
  options: Params,
  rootDir: string
): StartParameters {
  return {
    name: config.name,
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
}

export function hasSwcTranspiler(config: Config) {
  return Object.values(config.projects).some((project) => {
    if (!(project as ApplicationConfigEntry).experiments?.transpilation) {
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
}

export function createDevServerApi(devServer) {
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
}
