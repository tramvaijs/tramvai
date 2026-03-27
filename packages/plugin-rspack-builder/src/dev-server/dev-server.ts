import '@tramvai/plugin-base-builder/lib/utils/cpu-profile';

import type { ExtractDependencyType, ExtractTokenType } from '@tinkoff/dippy';
import type {
  DEV_SERVER_CLOSE_HANDLER_TOKEN,
  PORT_MANAGER_TOKEN,
  TRACER_TOKEN,
  DEV_SERVER_TOKEN,
} from '@tramvai/api/lib/tokens';

import { CONFIG_SERVICE_TOKEN, INPUT_PARAMETERS_TOKEN } from '@tramvai/api/lib/config';
import { logger } from '@tramvai/api/lib/services/logger';
import {
  resolvePublicPathDirectory,
  CompilationWatcher,
} from '@tramvai/plugin-base-builder/lib/utils';

import { ServerRunnerWorkerBridge } from '@tramvai/plugin-base-builder/lib/server-runner/worker-bridge';
import { createProxy } from '@tramvai/plugin-base-builder/lib/server-runner/proxy';
import { SELF_SIGNED_CERTIFICATE_TOKEN } from '@tramvai/plugin-base-builder/lib/utils/selfSignedCertificate';
import { runBuild } from './builder';

type DevServerApi = ExtractTokenType<typeof DEV_SERVER_TOKEN>;

const SERVER_RUNNER_TID = 1;

export function createDevServer({
  inputParameters,
  portManager,
  config,
  selfSignedCertificate,
  tracer,
  closeHandlers,
}: {
  inputParameters: ExtractDependencyType<typeof INPUT_PARAMETERS_TOKEN>;
  portManager: ExtractDependencyType<typeof PORT_MANAGER_TOKEN>;
  config: ExtractDependencyType<typeof CONFIG_SERVICE_TOKEN>;
  selfSignedCertificate: ExtractDependencyType<typeof SELF_SIGNED_CERTIFICATE_TOKEN>;
  tracer: ExtractDependencyType<typeof TRACER_TOKEN>;
  closeHandlers: ExtractDependencyType<typeof DEV_SERVER_CLOSE_HANDLER_TOKEN>;
}): DevServerApi {
  return {
    // eslint-disable-next-line max-statements
    start: async () => {
      tracer.mark({
        event: 'dev-server.started',
        category: ['plugin-rspack-builder'],
      });
      const { buildType } = config;
      const isServerBuildNeeded = buildType === 'server' || buildType === 'all';
      const isClientBuildNeeded = buildType === 'client' || buildType === 'all';

      await portManager.computeAvailablePorts();

      const [buildPort, serverRunnerPort] = await Promise.all([
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
        hostname: config.host,
        selfSignedCertificate,
        serverBuildPort: buildPort,
        browserBuildPort: buildPort,
        serverRunnerPort,
        compilationWatcher,
      });

      let closedPromise: Promise<any> | null = null;
      let buildResolve: Function;
      let buildReject: Function;
      const buildPromise = new Promise<void>((resolve, reject) => {
        buildResolve = resolve;
        buildReject = reject;
      });

      const serverRunnerWorkerPath = require.resolve(
        '@tramvai/plugin-base-builder/lib/server-runner/server-runner.js'
      );
      const serverPublicPath = resolvePublicPathDirectory(config.outputServer);
      let serverRunnerAbortController: AbortController | undefined;
      let initialServerBuild = true;

      const serverRunnerWorker = new ServerRunnerWorkerBridge({
        config,
        workerPath: serverRunnerWorkerPath,
        workerData: {
          port: serverRunnerPort,
          proxyPort: portManager.port!,
          disableServerRunnerWaiting: config.disableServerRunnerWaiting,
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
              category: ['plugin-rspack-builder'],
            },
            async () => {
              const response = await fetch(
                `http://localhost:${buildPort}${serverPublicPath}server.js`,
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
              category: ['plugin-rspack-builder'],
              tid: SERVER_RUNNER_TID,
            },
            () => {
              return serverRunnerWorker.compile({ code });
            }
          );

          compilationWatcher.endCompilation();

          buildResolve();
        } catch (error) {
          compilationWatcher.endCompilation();

          if (signal?.aborted) {
            buildResolve();
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
            buildReject(error);
          }
        }
      }

      const { buildServer, getBuildStats } = await runBuild(
        config,
        {
          buildPort,
          devServerPort: portManager.port!,
          inputParameters,
          isServerBuildNeeded,
          isClientBuildNeeded,
          tracer,
          isInitialBuild: () => initialServerBuild,
        },
        {
          onBuildEnd: isServerBuildNeeded
            ? () => {}
            : () => {
                buildResolve();
                compilationWatcher.endCompilation();
              },
          onServerBuildEnd: compileServerAfterBuild,
          onBuildFail: buildReject!,
          onWatchRun: compilationWatcher.startCompilation,
        }
      );

      if (isServerBuildNeeded) {
        await createServerRunnerWorker();
      }

      await proxy.listen();

      return {
        port: portManager.port!,
        staticPort: portManager.staticPort!,
        server: proxy.server,
        staticServer: proxy.staticServer,
        getStats: getBuildStats,
        close: async () => {
          if (closedPromise) {
            await closedPromise;
            return;
          }

          tracer.mark({
            event: 'dev-server.close',
            category: ['plugin-rspack-builder'],
          });

          closedPromise = Promise.all([
            proxy.close(),
            serverRunnerWorker.destroy(),
            buildServer.stop(),
            ...closeHandlers.map((handler) => handler()),
          ]);

          await closedPromise;
        },
        invalidate: async () => {
          await buildServer.invalidate();
        },
        // need to wait for all builds to finish, because if we close compilation right after first build (e.g. in tests),
        // file-system caches will not be flushed for the other build
        buildPromise: Promise.allSettled([buildPromise]).then(() => {}),
      };
    },
  };
}
