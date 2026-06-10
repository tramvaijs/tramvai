/* eslint-disable max-statements */
import { Compiler, Configuration, DevServer, RspackOptions, rspack } from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';

import { CONFIG_SERVICE_TOKEN } from '@tramvai/api/lib/config';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { logger } from '@tramvai/api/lib/services/logger';
import { TRACER_TOKEN } from '@tramvai/api/lib/tokens';
import { DevServer as TramvaiDevServer } from '@tramvai/api/src/builder/dev-server';
import { calculateBuildTime, maxMemoryRss } from '@tramvai/plugin-base-builder/lib/utils';

import { rspackConfig as rspackApplicationDevelopmentServerConfig } from '../rspack/application-development-server';
import { rspackConfig as rspackApplicationDevelopmentClientConfig } from '../rspack/application-development-client';

export async function runBuild(
  config: ExtractDependencyType<typeof CONFIG_SERVICE_TOKEN>,
  {
    tracer,
    buildPort,
    devServerPort,
    isInitialBuild,
    isServerBuildNeeded,
    isClientBuildNeeded,
  }: {
    buildPort: number;
    devServerPort: number;
    tracer: ExtractDependencyType<typeof TRACER_TOKEN>;
    isServerBuildNeeded: boolean;
    isClientBuildNeeded: boolean;
    isInitialBuild: () => boolean;
  },
  hooks: {
    onBuildEnd: Function;
    onBuildFail: Function;
    onWatchRun: Function;
    onServerBuildEnd: Function;
  }
): Promise<{ buildServer: RspackDevServer; getBuildStats: TramvaiDevServer['getStats'] }> {
  let rspackConfig: Configuration[];
  switch (`${config.projectType}`) {
    case 'application': {
      rspackConfig = await Promise.all(
        [
          isClientBuildNeeded && rspackApplicationDevelopmentClientConfig(config),
          isServerBuildNeeded && rspackApplicationDevelopmentServerConfig(config),
        ].filter(Boolean) as RspackOptions[]
      );
      break;
    }
  }

  const multiCompiler = rspack(rspackConfig!.flat());
  const serverCompiler = multiCompiler.compilers.find((cmp) => cmp.name === 'server');
  const clientCompiler = multiCompiler.compilers.find((cmp) => cmp.name === 'client');

  // Create shared store for multicompiler build
  // Used for transfer information from one build to another
  const sharedStore = new Map<string, any>();
  multiCompiler.compilers.forEach((singleCompiler) => {
    // @ts-expect-error
    singleCompiler.sharedStore = sharedStore;
  });

  const getMaxMemoryRss = maxMemoryRss();
  const getClientTime = clientCompiler && calculateBuildTime(clientCompiler);
  const getServerTime = serverCompiler && calculateBuildTime(serverCompiler);

  let measureRspackWatch: Function | null;
  let measureRspackBuild: Function | null = tracer.measureAsync({
    event: 'rspack.build',
    category: ['plugin-rspack-builder'],
  });

  function onBuildEnd() {
    if (measureRspackBuild) {
      measureRspackBuild();
      measureRspackBuild = null;
    }

    if (measureRspackWatch) {
      measureRspackWatch();
      measureRspackWatch = null;
    }

    hooks.onBuildEnd();
  }

  multiCompiler.hooks.done.tap('rspack-dev-server', async (stats) => {
    onBuildEnd();

    if (stats.hasErrors()) {
      const { errors } = stats.toJson({
        all: false,
        errors: true,
        errorDetails: true,
      });

      hooks.onBuildFail(errors);
    } else {
      logger.event({
        type: 'debug',
        event: 'rspack-builder',
        message: 'Compilation done',
      });
    }
  });

  multiCompiler.compilers.forEach((compiler: Compiler) => {
    compiler.hooks.failed.tap('rspack-builder', async (error) => {
      logger.event({
        type: 'warning',
        event: 'rspack-builder',
        message: `rspack ${compiler.name} build compilation failed`,
        payload: { error },
      });
    });
  });

  multiCompiler.hooks.watchRun.tap('rspack-builder', () => {
    if (!isInitialBuild()) {
      measureRspackWatch = tracer.measureAsync({
        event: 'rspack.watch',
        category: ['plugin-rspack-builder'],
      });
    }
  });

  if (serverCompiler) {
    serverCompiler.hooks.done.tap('rspack-builder', () => hooks.onServerBuildEnd());
    serverCompiler.hooks.watchRun.tap('rspack-builder', () => hooks.onWatchRun());
  }

  const devServerOptions: DevServer = {
    devMiddleware: {
      writeToDisk: config.writeToDisk,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Timing-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    },
    hot: config.hotRefresh?.enabled,
    client: {
      webSocketURL: {
        port: devServerPort,
      },
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
    },
    port: buildPort,
  };

  if (config.disableWebSocketServer) {
    devServerOptions.webSocketServer = false;
  }

  const buildServer = new RspackDevServer(devServerOptions, multiCompiler);

  await buildServer.start();
  logger.event({
    type: 'debug',
    event: 'rspack-builder',
    message: `dev-server compilation started at ${buildPort} port`,
  });

  return {
    buildServer,
    getBuildStats: () => ({
      client: {
        buildTime: getClientTime?.(),
      },
      server: {
        buildTime: getServerTime?.(),
      },
      maxMemoryRss: getMaxMemoryRss?.(),
    }),
  };
}
