import path from 'node:path';
import type { ExtractDependencyType, ExtractTokenType } from '@tinkoff/dippy';
import type {
  DEV_SERVER_CLOSE_HANDLER_TOKEN,
  PORT_MANAGER_TOKEN,
  TRACER_TOKEN,
  DEV_SERVER_TOKEN,
} from '@tramvai/api/lib/tokens';
import { BuildStats } from '@tramvai/api/lib/builder/dev-server';
import { logger } from '@tramvai/api/lib/services/logger';
import type { CONFIG_SERVICE_TOKEN, INPUT_PARAMETERS_TOKEN } from '@tramvai/api/lib/config';
import { resolvePublicPathDirectory } from '../webpack/utils/publicPath';
import { BUILD_DONE, BUILD_FAILED, WATCH_RUN } from '../workers/webpack.events';
import { WebpackWorkerBridge } from './webpack-worker-bridge';
import { ServerRunnerWorkerBridge } from './server-runner-worker-bridge';
import { createProxy } from './proxy';
import { ProgressBar } from '../utils/progress-bar';
import { CompilationWatcher } from '../utils/compilation-watcher';

type DevServerApi = ExtractTokenType<typeof DEV_SERVER_TOKEN>;

const SERVER_BUILD_TID = 1;
const CLIENT_BUILD_TID = 2;
const SERVER_RUNNER_TID = 3;

export function createDevServer({
  inputParameters,
  portManager,
  config,
  tracer,
  closeHandlers,
}: {
  inputParameters: ExtractDependencyType<typeof INPUT_PARAMETERS_TOKEN>;
  portManager: ExtractDependencyType<typeof PORT_MANAGER_TOKEN>;
  config: ExtractDependencyType<typeof CONFIG_SERVICE_TOKEN>;
  tracer: ExtractDependencyType<typeof TRACER_TOKEN>;
  closeHandlers: ExtractDependencyType<typeof DEV_SERVER_CLOSE_HANDLER_TOKEN>;
}): DevServerApi {
  return {
    // eslint-disable-next-line max-statements
    start: async () => {
      tracer.mark({
        event: 'dev-server.started',
        category: ['plugin-webpack-builder'],
      });

      const { buildType, disableServerRunnerWaiting } = config;

      await portManager.computeAvailablePorts();

      const [serverBuildPort, browserBuildPort, serverRunnerPort] = await Promise.all([
        portManager.resolveFreePort(0),
        portManager.resolveFreePort(0),
        portManager.resolveFreePort(0),
      ]);

      if (!inputParameters.staticPort) {
        inputParameters.staticPort = portManager.staticPort!;
      }

      const compilationWatcher = new CompilationWatcher();
      const proxy = createProxy({
        port: portManager.port!,
        staticPort: portManager.staticPort!,
        serverBuildPort,
        browserBuildPort,
        serverRunnerPort,
        compilationWatcher,
      });

      let closedPromise: Promise<any> | null = null;
      let serverResolve: Function;
      let serverReject: Function;
      let clientResolve: Function;
      let clientReject: Function;
      // eslint-disable-next-line promise/param-names
      const serverPromise = new Promise<void>((res, rej) => {
        serverResolve = res;
        serverReject = rej;
      });
      // eslint-disable-next-line promise/param-names
      const clientPromise = new Promise<void>((res, rej) => {
        clientResolve = res;
        clientReject = rej;
      });

      const webpackWorkerPath = path.resolve(__dirname, '..', 'workers', 'webpack.js');
      const serverRunnerWorkerPath = path.resolve(__dirname, '..', 'workers', 'server-runner.js');
      const serverPublicPath = resolvePublicPathDirectory(config.outputServer);
      const progressBar = new ProgressBar();
      let serverStats: BuildStats | undefined;
      let clientStats: BuildStats | undefined;
      let serverRunnerAbortController: AbortController | undefined;
      let initialServerBuild = true;
      let initialClientBuild = true;

      const serverRunnerWorker = new ServerRunnerWorkerBridge({
        config,
        workerPath: serverRunnerWorkerPath,
        workerData: {
          port: serverRunnerPort,
          proxyPort: portManager.port!,
          disableServerRunnerWaiting,
        },
      });
      const serverWebpackWorker = new WebpackWorkerBridge({
        config,
        progressBar,
        workerPath: webpackWorkerPath,
        workerData: {
          type: config.projectType,
          target: 'server',
          port: serverBuildPort,
          inputParameters,
          extraConfiguration: config.extraConfiguration,
        },
      });
      const clientWebpackWorker = new WebpackWorkerBridge({
        config,
        progressBar,
        workerPath: webpackWorkerPath,
        workerData: {
          type: config.projectType,
          target: 'client',
          port: browserBuildPort,
          inputParameters,
          extraConfiguration: config.extraConfiguration,
        },
      });

      async function createServerRunnerWorker() {
        serverRunnerAbortController?.abort();
        await serverRunnerWorker.destroy();

        serverRunnerAbortController = new AbortController();
        serverRunnerWorker.create();
      }

      async function compileServerAfterBuild() {
        const signal = serverRunnerAbortController?.signal;

        try {
          const code = await tracer.wrap(
            {
              event: 'dev-server.fetch-server-js',
              category: ['plugin-webpack-builder'],
            },
            async () => {
              const response = await fetch(
                `http://localhost:${serverBuildPort}${serverPublicPath}server.js`,
                {
                  signal,
                }
              );

              return response.text();
            }
          );

          if (!initialServerBuild) {
            await createServerRunnerWorker();
          } else {
            initialServerBuild = false;
          }

          await tracer.wrap(
            {
              event: 'server-runner-worker.compile',
              category: ['plugin-webpack-builder'],
              tid: SERVER_RUNNER_TID,
            },
            () => {
              return serverRunnerWorker.compile({ code });
            }
          );

          compilationWatcher.endCompilation();

          serverResolve();
        } catch (error) {
          compilationWatcher.endCompilation();

          if (signal?.aborted) {
            serverResolve();
          } else {
            logger.event({
              type: 'error',
              event: 'server-runner',
              message: `server.js request failed`,
              payload: {
                // @ts-expect-error
                errors: error?.cause?.errors,
              },
            });
            serverReject(error);
          }
        }
      }

      if (buildType !== 'client') {
        let measureServerWebpackWorker: Function | null = tracer.measureAsync({
          event: 'server-webpack-worker.build',
          category: ['plugin-webpack-builder'],
          tid: SERVER_BUILD_TID,
        });
        let measureWatchServerWebpackWorker: Function | null;

        await createServerRunnerWorker();

        serverWebpackWorker.create();

        // TODO: DEV_SERVER_STARTED
        // TODO: debounce?
        serverWebpackWorker.subscribe(BUILD_DONE, ({ stats }) => {
          serverStats = stats;
          compileServerAfterBuild();

          if (measureServerWebpackWorker) {
            measureServerWebpackWorker();
            measureServerWebpackWorker = null;
          }
          if (measureWatchServerWebpackWorker) {
            measureWatchServerWebpackWorker();
            measureWatchServerWebpackWorker = null;
          }
        });
        serverWebpackWorker.subscribe(BUILD_FAILED, (data) => {
          serverReject(data.errors);

          compileServerAfterBuild();

          if (measureServerWebpackWorker) {
            measureServerWebpackWorker();
            measureServerWebpackWorker = null;
          }
          if (measureWatchServerWebpackWorker) {
            measureWatchServerWebpackWorker();
            measureWatchServerWebpackWorker = null;
          }
        });
        serverWebpackWorker.subscribe(WATCH_RUN, () => {
          if (!initialServerBuild) {
            measureWatchServerWebpackWorker = tracer.measureAsync({
              event: 'server-webpack-worker.watch',
              category: ['plugin-webpack-builder'],
              tid: SERVER_BUILD_TID,
            });
          }

          compilationWatcher.startCompilation();
        });
      }

      if (buildType !== 'server') {
        let measureClientWebpackWorker: Function | null = tracer.measureAsync({
          event: 'client-webpack-worker.build',
          category: ['plugin-webpack-builder'],
          tid: CLIENT_BUILD_TID,
        });
        let measureWatchClientWebpackWorker: Function | null;

        clientWebpackWorker.create();

        // TODO: DEV_SERVER_STARTED
        clientWebpackWorker.subscribe(BUILD_DONE, ({ stats }) => {
          clientStats = stats;
          clientResolve();

          if (measureClientWebpackWorker) {
            measureClientWebpackWorker();
            measureClientWebpackWorker = null;
          }
          if (measureWatchClientWebpackWorker) {
            measureWatchClientWebpackWorker();
            measureWatchClientWebpackWorker = null;
          }

          if (initialClientBuild) {
            initialClientBuild = false;
          }
        });
        clientWebpackWorker.subscribe(BUILD_FAILED, (data) => {
          clientReject(data.errors);

          if (measureClientWebpackWorker) {
            measureClientWebpackWorker();
            measureClientWebpackWorker = null;
          }
          if (measureWatchClientWebpackWorker) {
            measureWatchClientWebpackWorker();
            measureWatchClientWebpackWorker = null;
          }

          if (initialClientBuild) {
            initialClientBuild = false;
          }
        });
        clientWebpackWorker.subscribe(WATCH_RUN, () => {
          if (!initialClientBuild) {
            measureWatchClientWebpackWorker = tracer.measureAsync({
              event: 'client-webpack-worker.watch',
              category: ['plugin-webpack-builder'],
              tid: CLIENT_BUILD_TID,
            });
          }
        });
      }

      await proxy.listen();

      return {
        port: portManager.port!,
        staticPort: portManager.staticPort!,
        httpServer: proxy.httpServer,
        staticHttpServer: proxy.staticHttpServer,
        getStats: () => ({
          client: clientStats!,
          server: serverStats!,
        }),
        close: async () => {
          if (closedPromise) {
            await closedPromise;
            return;
          }

          tracer.mark({
            event: 'dev-server.close',
            category: ['plugin-webpack-builder'],
          });

          closedPromise = Promise.all([
            proxy.close(),
            serverRunnerWorker.destroy(),
            serverWebpackWorker.destroy(),
            clientWebpackWorker.destroy(),
            ...closeHandlers.map((handler) => handler()),
          ]);

          await closedPromise;
        },
        invalidate: async () => {
          await Promise.all([serverWebpackWorker.invalidate(), clientWebpackWorker.invalidate()]);
        },
        // need to wait for all builds to finish, because if we close compilation right after first build (e.g. in tests),
        // file-system caches will not be flushed for the other build
        buildPromise: Promise.allSettled(
          [
            (buildType === 'all' || buildType === 'server') && serverPromise,
            (buildType === 'all' || buildType === 'client') && clientPromise,
          ].filter(Boolean)
        ).then(() => {}),
      };
    },
  };
}
