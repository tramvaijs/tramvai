import '../utils/inspector';
import '@tramvai/api/lib/utils/cpu-profile';
import { parentPort, workerData } from 'node:worker_threads';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import express from 'express';
import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  ConfigService,
  INPUT_PARAMETERS_TOKEN,
} from '@tramvai/api/lib/config';
import { initContainer, isValidModule, optional, provide } from '@tinkoff/dippy';
import type { ModuleType, ExtendedModule } from '@tinkoff/dippy';
import { logger } from '@tramvai/api/lib/services/logger';
import { resolvePublicPathDirectory } from '../webpack/utils/publicPath';
import { webpackConfig as webpackApplicationDevelopmentServerConfig } from '../webpack/application-development-server';
import { webpackConfig as webpackApplicationDevelopmentClientConfig } from '../webpack/application-development-client';
import { BUILD_MODE_TOKEN, BUILD_TYPE_TOKEN, WEBPACK_TRANSPILER_TOKEN } from '../index';
import {
  BUILD_DONE,
  BUILD_FAILED,
  DEV_SERVER_STARTED,
  EXIT,
  INVALIDATE,
  INVALIDATE_DONE,
  WATCH_RUN,
  WebpackWorkerData,
  WebpackWorkerIncomingEventsPayload,
  WebpackWorkerOutgoingEventsPayload,
} from './webpack.events';
import { BUILD_TARGET_TOKEN } from '../webpack/webpack-config';
import { calculateBuildTime } from '../utils/calculateBuildTime';
import { maxMemoryRss } from '../utils/maxMemoryRss';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

// eslint-disable-next-line max-statements
async function runWebpackDevServer() {
  const getMaxMemoryRss = maxMemoryRss();
  const { type, target, port, inputParameters, extraConfiguration } =
    workerData as WebpackWorkerData;
  const app = express();

  const config = new ConfigService(
    {
      mode: 'development',
      ...inputParameters,
    },
    extraConfiguration
  );
  await config.initialize();

  const plugins: Array<ModuleType | ExtendedModule> = config.plugins.map((plugin) => {
    if (typeof plugin === 'string') {
      const possibleModule = require(plugin).default;

      if (isValidModule(possibleModule)) {
        return possibleModule;
      }

      throw Error(
        `Plugin "${plugin}" is not a valid @tramvai/api module. Module should be created with "declareModule" method, and be exported as default`
      );
    }

    return plugin;
  });

  const di = initContainer({
    modules: plugins,
    providers: [
      provide({
        provide: CONFIG_SERVICE_TOKEN,
        useValue: config,
      }),
      provide({
        provide: INPUT_PARAMETERS_TOKEN,
        useValue: inputParameters,
      }),
      provide({
        provide: BUILD_TYPE_TOKEN,
        useValue: type,
      }),
      provide({
        provide: BUILD_TARGET_TOKEN,
        useValue: target,
      }),
      provide({
        provide: BUILD_MODE_TOKEN,
        useValue: 'development',
      }),
    ],
  });

  const transpiler = di.get(optional(WEBPACK_TRANSPILER_TOKEN));
  if (!transpiler) {
    throw Error(
      `Transpiler not found, make sure you add "@tramvai/plugin-babel-transpiler" or "@tramvai/plugin-swc-transpiler" to tramvai config file`
    );
  }

  const configExtensions = di.get(optional(CONFIGURATION_EXTENSION_TOKEN));
  if (Array.isArray(configExtensions)) {
    config.loadExtensions(configExtensions);
  }

  let webpackConfig: webpack.Configuration;

  switch (`${type}-${target}`) {
    case 'application-client': {
      webpackConfig = await webpackApplicationDevelopmentClientConfig({ di });
      break;
    }
    case 'application-server': {
      webpackConfig = await webpackApplicationDevelopmentServerConfig({ di });
      break;
    }
  }

  const compiler = webpack(webpackConfig!)!;
  const getBuildTime = calculateBuildTime(compiler);

  compiler.hooks.done.tap('worker-dev-server', async (stats) => {
    if (stats.hasErrors()) {
      const { errors } = stats.toJson({ all: false, errors: true, errorDetails: true });

      logger.event({
        type: 'warning',
        event: 'webpack-worker',
        message: 'Compilation done with errors',
        payload: { errors },
      });

      parentPort!.postMessage({
        event: BUILD_FAILED,
        errors,
      } as WebpackWorkerOutgoingEventsPayload['build-failed']);
    } else {
      logger.event({
        type: 'debug',
        event: 'webpack-worker',
        message: 'Compilation done',
      });

      parentPort!.postMessage({
        event: BUILD_DONE,
        stats: {
          maxMemoryRss: getMaxMemoryRss(),
          buildTime: getBuildTime(),
        },
      } as WebpackWorkerOutgoingEventsPayload['build-done']);
    }
  });

  compiler.hooks.failed.tap('worker-dev-server', async (error) => {
    logger.event({
      type: 'warning',
      event: 'webpack-worker',
      message: `${target} compilation failed`,
      payload: { error },
    });

    parentPort!.postMessage({
      event: BUILD_FAILED,
      errors: [error],
    } as WebpackWorkerOutgoingEventsPayload['build-failed']);
  });

  compiler.hooks.watchRun.tap('worker-dev-server', async () => {
    parentPort!.postMessage({
      event: WATCH_RUN,
    } as WebpackWorkerOutgoingEventsPayload['watch-run']);
  });

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Timing-Allow-Origin', '*');

    next();
  });

  const devMiddleware = webpackDevMiddleware(compiler, {
    writeToDisk: config.writeToDisk,
    publicPath: resolvePublicPathDirectory(
      target === 'server' ? config.outputServer : config.outputClient
    ),
  });

  // TODO: parameter to configure { writeToDisk: true } - can be much less memory consumption
  app.use(devMiddleware);

  app.use(
    getHotModulePrefix(config),
    // @ts-ignore - https://github.com/DefinitelyTyped/DefinitelyTyped/pull/73338
    webpackHotMiddleware(compiler, { log: false, statsOptions: { cached: false } })
  );

  app.listen(port, () => {
    logger.event({
      type: 'debug',
      event: 'webpack-worker',
      message: `dev-server for ${target} compilation started at ${port} port`,
    });

    parentPort!.postMessage({
      event: DEV_SERVER_STARTED,
    } as WebpackWorkerOutgoingEventsPayload['dev-server-started']);
  });

  // setTimeout(() => {
  //   write();
  // }, 15000);

  parentPort?.on(
    'message',
    ({ event }: WebpackWorkerIncomingEventsPayload[keyof WebpackWorkerIncomingEventsPayload]) => {
      switch (event) {
        // we need to terminate worker after compiler is closed, and all event loop active handles are closed,
        // for example `chokidar` file watchers, otherwise, parent process will be exited prematurelly with "SIGABRT" signal.
        case EXIT:
          // @ts-expect-error
          if (devMiddleware.context.watching?.running) {
            // we don't need to wait for callback, because if build in progress, it will be waiting for finish
            compiler.close(() => {});

            setTimeout(() => {
              process.exit(0);
            });
          } else {
            compiler.close((error) => {
              process.exit(0);
            });
          }
          break;
        case INVALIDATE:
          if (devMiddleware.context.watching) {
            devMiddleware.context.watching.invalidate(() => {
              parentPort!.postMessage({
                event: INVALIDATE_DONE,
              } as WebpackWorkerOutgoingEventsPayload['invalidate-done']);
            });
          } else {
            parentPort!.postMessage({
              event: INVALIDATE_DONE,
            } as WebpackWorkerOutgoingEventsPayload['invalidate-done']);
          }
          break;
      }
    }
  );
}

runWebpackDevServer();

function getHotModulePrefix(config: ConfigService): string {
  if (config.projectType === 'application') {
    return `/${config.outputClient}`;
  }

  if (config.projectType === 'child-app') {
    return `/${config.projectName}`;
  }

  throw new Error(`${config.projectType} is not supported`);
}

process.on('unhandledRejection', (error) => {
  logger.event({
    type: 'error',
    event: 'webpack-worker',
    message: 'unhandledRejection',
    payload: { error },
  });

  parentPort!.postMessage({
    event: BUILD_FAILED,
    errors: [error],
  } as WebpackWorkerOutgoingEventsPayload['build-failed']);

  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.event({
    type: 'error',
    event: 'webpack-worker',
    message: 'uncaughtException',
    payload: { error },
  });

  parentPort!.postMessage({
    event: BUILD_FAILED,
    errors: [error],
  } as WebpackWorkerOutgoingEventsPayload['build-failed']);

  process.exit(1);
});

async function runExitHandlersAndQuit(code: number) {
  if (code !== 0) {
    logger.event({
      type: 'error',
      event: 'webpack-worker',
      message: 'exit',
      payload: { code },
    });
  }

  if (global.__TRAMVAI_EXIT_HANDLERS__) {
    await Promise.allSettled(global.__TRAMVAI_EXIT_HANDLERS__.map((handler) => handler()));
  }
  process.exit(code);
}

process.on('exit', async (code) => runExitHandlersAndQuit(code));
