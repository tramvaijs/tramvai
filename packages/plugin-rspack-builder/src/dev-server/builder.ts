/* eslint-disable max-statements */
import {
  Compiler,
  Configuration,
  DevServer,
  RspackOptions,
  StatsError,
  rspack,
} from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';

import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  InputParameters,
} from '@tramvai/api/lib/config';
import { optional, provide } from '@tinkoff/dippy';
import type { ExtractDependencyType, DI_TOKEN } from '@tinkoff/dippy';
import { logger } from '@tramvai/api/lib/services/logger';
import { TRACER_TOKEN } from '@tramvai/api/lib/tokens';
import { DevServer as TramvaiDevServer } from '@tramvai/api/src/builder/dev-server';
import { calculateBuildTime, maxMemoryRss } from '@tramvai/plugin-base-builder/lib/utils';

import { rspackConfig as rspackApplicationDevelopmentServerConfig } from '../rspack/application-development-server';
import { rspackConfig as rspackApplicationDevelopmentClientConfig } from '../rspack/application-development-client';
import { RSPACK_TRANSPILER_TOKEN } from '../rspack/shared/transpiler';
import { BUILD_MODE_TOKEN, BUILD_TYPE_TOKEN } from '../rspack/rspack-config';

export async function runBuild(
  config: ExtractDependencyType<typeof CONFIG_SERVICE_TOKEN>,
  {
    tracer,
    buildPort,
    devServerPort,
    isInitialBuild,
    isServerBuildNeeded,
    isClientBuildNeeded,
    inputParameters,
  }: {
    buildPort: number;
    devServerPort: number;
    tracer: ExtractDependencyType<typeof TRACER_TOKEN>;
    isServerBuildNeeded: boolean;
    isClientBuildNeeded: boolean;
    isInitialBuild: () => boolean;
    inputParameters: InputParameters;
  },
  hooks: {
    onBuildEnd: Function;
    onBuildFail: Function;
    onWatchRun: Function;
    onServerBuildEnd: Function;
  }
): Promise<{ buildServer: RspackDevServer; getBuildStats: TramvaiDevServer['getStats'] }> {
  let rspackConfig: Configuration[];
  const { extraConfiguration } = config;

  switch (`${config.projectType}`) {
    case 'application': {
      rspackConfig = await Promise.all(
        [
          isClientBuildNeeded &&
            rspackApplicationDevelopmentClientConfig(inputParameters, extraConfiguration),
          isServerBuildNeeded &&
            rspackApplicationDevelopmentServerConfig(inputParameters, extraConfiguration),
        ].filter(Boolean) as RspackOptions[]
      );
      break;
    }
  }

  const multiCompiler = rspack(rspackConfig!);
  const serverCompiler = multiCompiler.compilers.find((cmp) => cmp.name === 'server');
  const clientCompiler = multiCompiler.compilers.find((cmp) => cmp.name === 'client');

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

  const onSuccessBuild = () => {
    logger.event({
      type: 'debug',
      event: 'rspack-builder',
      message: 'Compilation done',
    });
  };
  const onFailedBuild = (errors?: StatsError[]) => {
    logger.event({
      type: 'warning',
      event: 'rspack-builder',
      message: 'Compilation done with errors',
      payload: { errors },
    });

    hooks.onBuildFail(errors);
  };

  multiCompiler.hooks.done.tap('rspack-dev-server', async (stats) => {
    onBuildEnd();

    if (stats.hasErrors()) {
      const { errors } = stats.toJson({ all: false, errors: true, errorDetails: true });
      onFailedBuild(errors);
    } else {
      onSuccessBuild();
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
      },
    },
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
