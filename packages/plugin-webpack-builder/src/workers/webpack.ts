import '@tramvai/plugin-base-builder/lib/utils/inspector';
import '@tramvai/plugin-base-builder/lib/utils/cpu-profile';
import { parentPort, workerData } from 'node:worker_threads';
import inspector from 'node:inspector';
import webpack, { Compiler, MultiCompiler, MultiStats, Stats } from 'webpack';
import WebpackDevServer, { Configuration as WebpackDevServerConfig } from 'webpack-dev-server';
import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  ConfigService,
  INPUT_PARAMETERS_TOKEN,
} from '@tramvai/api/lib/config';
import { Container, isValidModule, optional, provide } from '@tinkoff/dippy';
import type { ModuleType, ExtendedModule } from '@tinkoff/dippy';
import { logger } from '@tramvai/api/lib/services/logger';
import { calculateBuildTime, maxMemoryRss } from '@tramvai/plugin-base-builder/lib/utils';
import { BUILD_TARGET_TOKEN } from '@tramvai/plugin-base-builder/lib/build-config';
import { WEBPACK_TRANSPILER_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/transpiler';

import { webpackConfig as webpackApplicationDevelopmentServerConfig } from '../webpack/application-development-server';
import { webpackConfig as webpackApplicationDevelopmentClientConfig } from '../webpack/application-development-client';
import { BUILD_MODE_TOKEN, BUILD_TYPE_TOKEN } from '../index';
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

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

const isMultiCompiler = (compiler: Compiler | MultiCompiler): compiler is MultiCompiler =>
  'compilers' in compiler;

// eslint-disable-next-line max-statements
async function runWebpackDevServer() {
  const getMaxMemoryRss = maxMemoryRss();
  const { type, target, buildPort, devServerPort, inputParameters, extraConfiguration } =
    workerData as WebpackWorkerData;

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

  const di = new Container({
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

  let webpackConfig: webpack.Configuration | webpack.Configuration[];

  switch (`${type}-${target}`) {
    case 'application-client': {
      webpackConfig = await webpackApplicationDevelopmentClientConfig({ di });
      break;
    }
    case 'application-server': {
      webpackConfig = await webpackApplicationDevelopmentServerConfig({ di });
      break;
    }
    default: {
      throw new Error(`Unknown config type: ${type}-${target}`);
    }
  }

  const compiler: Compiler | MultiCompiler =
    // @ts-expect-error - cannot use config | config[] union type in webpack call
    webpack(webpackConfig!)!;
  const getBuildTime = calculateBuildTime(compiler);

  // Create shared store for multicompiler build
  // Used for transfer information from one build to another
  if ('compilers' in compiler) {
    const sharedStore = new Map<string, any>();
    compiler.compilers.forEach((singleCompiler) => {
      // @ts-expect-error
      singleCompiler.sharedStore = sharedStore;
    });
  }

  compiler.hooks.done.tap('worker-dev-server', async (stats: Stats | MultiStats) => {
    if (stats.hasErrors()) {
      const { errors } = stats.toJson({ all: false, errors: true, errorDetails: true });

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

  // MultiCompiler does not have a failed hook
  const failedHooks = isMultiCompiler(compiler)
    ? compiler.compilers.map((childCompiler) => childCompiler.hooks.failed)
    : [compiler.hooks.failed];

  failedHooks.forEach((failedHook) =>
    failedHook.tap('worker-dev-server', async (error) => {
      parentPort!.postMessage({
        event: BUILD_FAILED,
        errors: [error],
      } as WebpackWorkerOutgoingEventsPayload['build-failed']);
    })
  );

  compiler.hooks.watchRun.tap('worker-dev-server', async () => {
    parentPort!.postMessage({
      event: WATCH_RUN,
    } as WebpackWorkerOutgoingEventsPayload['watch-run']);
  });

  const devServerOptions: WebpackDevServerConfig = {
    devMiddleware: {
      writeToDisk: config.writeToDisk,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Timing-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    },
    hot: config.hotRefresh?.enabled,
    // compressing server.js takes longer than request without compression
    compress: false,
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

  if (config.disableWebSocketServer || !config.liveReload) {
    devServerOptions.webSocketServer = false;
  }

  const devServer = new WebpackDevServer(devServerOptions, compiler);

  devServer.startCallback((err) => {
    logger.event({
      type: 'debug',
      event: 'webpack-worker',
      message: `dev-server for ${target} compilation started at ${buildPort} port`,
    });

    parentPort!.postMessage({
      event: DEV_SERVER_STARTED,
    } as WebpackWorkerOutgoingEventsPayload['dev-server-started']);
  });

  parentPort?.on(
    'message',
    ({ event }: WebpackWorkerIncomingEventsPayload[keyof WebpackWorkerIncomingEventsPayload]) => {
      switch (event) {
        // we need to terminate worker after compiler is closed, and all event loop active handles are closed,
        // for example `chokidar` file watchers, otherwise, parent process will be exited prematurelly with "SIGABRT" signal.
        case EXIT:
          // wait for compiler close for cache storing
          devServer.compiler.close(() => {
            devServer.stop();
            devServer.stopCallback(() => {
              process.exit(0);
            });
          });
          break;
        case INVALIDATE:
          devServer.invalidate(() => {
            parentPort!.postMessage({
              event: INVALIDATE_DONE,
            } as WebpackWorkerOutgoingEventsPayload['invalidate-done']);
          });
          break;
      }
    }
  );
}

runWebpackDevServer();

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

  // When a Chrome DevTools session is active
  // a worker process may not terminate when the main process exits
  // To avoid this, explicitly close the debugging session before shutting down the worker
  inspector.close();
  if (global.__TRAMVAI_EXIT_HANDLERS__) {
    await Promise.allSettled(global.__TRAMVAI_EXIT_HANDLERS__.map((handler) => handler()));
  }
  process.exit(code);
}

process.on('exit', async (code) => runExitHandlersAndQuit(code));
