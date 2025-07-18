import path from 'node:path';
import type { ExtractDependencyType, ExtractTokenType } from '@tinkoff/dippy';
import type {
  DEV_SERVER_CLOSE_HANDLER_TOKEN,
  PORT_MANAGER_TOKEN,
  TRACER_TOKEN,
  DEV_SERVER_TOKEN,
} from '@tramvai/api/lib/tokens';
import type { CONFIG_SERVICE_TOKEN, INPUT_PARAMETERS_TOKEN } from '@tramvai/api/lib/config';
import { resolvePublicPathDirectory } from '../webpack/utils/publicPath';
import { BUILD_DONE, BUILD_FAILED, WATCH_RUN } from '../workers/webpack.events';
import { WebpackWorkerBridge } from './webpack-worker-bridge';
import { ServerRunnerWorkerBridge } from './server-runner-worker-bridge';
import { createProxy } from './proxy';
import { ProgressBar } from '../utils/progress-bar';

type DevServerApi = ExtractTokenType<typeof DEV_SERVER_TOKEN>;

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

      const { buildType } = config;

      await portManager.computeAvailablePorts();

      const [serverBuildPort, browserBuildPort, serverRunnerPort] = await Promise.all([
        portManager.resolveFreePort(0),
        portManager.resolveFreePort(0),
        portManager.resolveFreePort(0),
      ]);

      const proxy = createProxy({
        port: portManager.port!,
        staticPort: portManager.staticPort!,
        serverBuildPort,
        browserBuildPort,
        serverRunnerPort,
      });

      let resolve: Function;
      let reject: Function;
      // eslint-disable-next-line promise/param-names
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });

      const webpackWorkerPath = path.resolve(__dirname, '..', 'workers', 'webpack.js');
      const serverRunnerWorkerPath = path.resolve(__dirname, '..', 'workers', 'server-runner.js');
      const serverPublicPath = resolvePublicPathDirectory(config.outputServer);
      const progressBar = new ProgressBar();
      let serverRunnerAbortController: AbortController | undefined;
      let initialServerBuild = true;
      let initialClientBuild = true;

      const serverRunnerWorker = new ServerRunnerWorkerBridge({
        config,
        workerPath: serverRunnerWorkerPath,
        workerData: {
          port: serverRunnerPort,
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
            },
            () => {
              return serverRunnerWorker.compile({ code });
            }
          );

          resolve();
        } catch (error) {
          if (signal?.aborted) {
            resolve();
          } else {
            // TODO: replace with logger from di?
            // @ts-expect-error
            // eslint-disable-next-line no-console
            console.error(`server.js request failed:`, error?.cause?.errors);
            reject(error);
          }
        }
      }

      if (buildType !== 'client') {
        let measureServerWebpackWorker: Function | null = tracer.measure({
          event: 'server-webpack-worker.build',
          category: ['plugin-webpack-builder'],
        });
        let measureWatchServerWebpackWorker: Function | null;

        await createServerRunnerWorker();

        serverWebpackWorker.create();

        // TODO: DEV_SERVER_STARTED
        // TODO: debounce?
        serverWebpackWorker.subscribe(BUILD_DONE, () => {
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
          reject(data.errors);

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
            measureWatchServerWebpackWorker = tracer.measure({
              event: 'server-webpack-worker.watch',
              category: ['plugin-webpack-builder'],
            });
          }
        });
      }

      if (buildType !== 'server') {
        let measureClientWebpackWorker: Function | null = tracer.measure({
          event: 'client-webpack-worker.build',
          category: ['plugin-webpack-builder'],
        });
        let measureWatchClientWebpackWorker: Function | null;

        clientWebpackWorker.create();

        // TODO: DEV_SERVER_STARTED
        clientWebpackWorker.subscribe(BUILD_DONE, () => {
          if (buildType === 'client') {
            resolve();
          }

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
          reject(data.errors);

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
            measureWatchClientWebpackWorker = tracer.measure({
              event: 'client-webpack-worker.watch',
              category: ['plugin-webpack-builder'],
            });
          }
        });
      }

      proxy.listen();

      // TODO await ready?

      return {
        port: portManager.port!,
        staticPort: portManager.staticPort!,
        close: async () => {
          tracer.mark({
            event: 'dev-server.close',
            category: ['plugin-webpack-builder'],
          });

          proxy.close();

          await Promise.all([
            serverRunnerWorker.destroy(),
            serverWebpackWorker.destroy(),
            clientWebpackWorker.destroy(),
            ...closeHandlers.map((handler) => handler()),
          ]);
        },
        buildPromise: promise,
      };
    },
  };
}
