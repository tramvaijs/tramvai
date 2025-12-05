import partition from '@tinkoff/utils/array/partition';
import path from 'path';
import { node } from 'execa';
import waitOn from 'wait-on';
import envCi from 'env-ci';
import isString from '@tinkoff/utils/is/string';
import type { Context } from '../../models/context';
import type { CommandResult } from '../../models/command';
import type { ApplicationConfigEntry } from '../../typings/configEntry/application';
import type { Params } from './command';
import { createConfigManager } from '../../config/configManager';
import { generateStatic } from './generate';
import { copyStatsJsonFileToServerDirectory } from '../../builder/webpack/utils/copyStatsJsonFile';
import { safeRequire } from '../../utils/safeRequire';
import { app } from '../index';
import { startStaticServer } from './staticServer';
import { startServer } from './server';
import { handleServerOutput } from './utils/handle-server-output';
import { appPrerenderRoutes } from '../../utils/dev-app/request';
import { PortManager } from '../../models/port-manager';

// eslint-disable-next-line max-statements
export const staticApp = async (
  context: Context,
  configEntry: ApplicationConfigEntry,
  options: Params
): Promise<CommandResult> => {
  const portManager = new PortManager({
    configEntry,
    commandParams: options,
    logger: context.logger,
  });

  await portManager.computeAvailablePorts();

  const clientConfigManager = createConfigManager<ApplicationConfigEntry>(configEntry, {
    env: 'production',
    ...options,
    buildType: 'client',
    port: portManager.port,
    staticPort: portManager.staticPort,
  });
  const serverConfigManager = clientConfigManager.withSettings({ buildType: 'server' });

  if (options.buildType !== 'none') {
    context.logger.event({
      type: 'debug',
      event: 'COMMAND:STATIC:BUILD',
      message: `message: build step was started`,
    });

    await app.run('build', options);

    await copyStatsJsonFileToServerDirectory(clientConfigManager);
  } else {
    context.logger.event({
      type: 'debug',
      event: 'COMMAND:STATIC:BUILD',
      message: `message: build step was skipped`,
    });
  }

  const {
    host,
    port,
    fileSystemPages: { rootErrorBoundaryPath },
  } = serverConfigManager;
  const root = serverConfigManager.buildPath;
  const assetsPrefix = process.env.ASSETS_PREFIX;

  if (!assetsPrefix) {
    context.logger.event({
      type: 'warning',
      event: 'COMMAND:STATIC:BUILD',
      message:
        'message: ASSETS_PREFIX variable is not defined. It will cause ' +
        'of incorrect urls for static assets in your files. Also, some features, ' +
        'like a resources inlining will not work.',
    });
  }

  context.logger.event({
    type: 'debug',
    event: 'COMMAND:STATIC:SERVER_START',
    message: `message: start application server on http://${host}:${port}`,
  });

  const staticServer = await startStaticServer(clientConfigManager);
  const staticAssetsPrefix = serverConfigManager.assetsPrefix;
  const envVariables = {
    ...(process.env.DANGEROUS_UNSAFE_ENV_FILES === 'true' || !envCi().isCi
      ? {
          ...safeRequire(path.resolve(process.cwd(), 'env.development'), true),
          ...safeRequire(path.resolve(process.cwd(), 'env'), true),
        }
      : {}),
    CACHE_WARMUP_DISABLED: 'true',
    ...process.env,
    NODE_ENV: 'production',
    TRAMVAI_CLI_COMMAND: 'static',
    PORT: `${port}`,
    PORT_SERVER: `${port}`,
    TRAMVAI_CLI_ASSETS_PREFIX: staticAssetsPrefix,
    ASSETS_PREFIX: assetsPrefix ?? staticAssetsPrefix,
  };

  const server = node(path.resolve(root, 'server.js'), [], {
    cwd: process.cwd(),
    env: envVariables,
  });

  server.catch((reason) => {
    context.logger.event({
      type: 'error',
      event: 'COMMAND:STATIC:BUILD',
      message: `message: server.js launch failed`,
      payload: reason,
    });
  });
  server.stdout.on('data', (chunk: Buffer) => {
    if (server.killed) {
      return;
    }

    handleServerOutput(context.logger, chunk);
  });
  server.stderr.on('data', (chunk: Buffer) => {
    if (server.killed) {
      return;
    }

    handleServerOutput(context.logger, chunk);
  });

  const readinessProbePath = `${clientConfigManager.httpProtocol}://localhost:${
    envVariables.UTILITY_SERVER_PORT ?? port
  }/readyz`;

  await Promise.race([
    server,
    waitOn({
      resources: [readinessProbePath],
      delay: 1000,
      interval: 250,
      timeout: 10 * 60 * 1000,
    }),
  ]);

  context.logger.event({
    type: 'debug',
    event: 'COMMAND:STATIC:ROUTES_FETCH',
    message: `message: server started, fetch application routes`,
  });

  let paths = await appPrerenderRoutes(serverConfigManager);

  if (isString(rootErrorBoundaryPath)) {
    // implicit connection with packages/modules/server/src/server/error.ts
    paths.push('/_errors/5xx');
  }

  if (options.onlyPages) {
    const [existed, unknown] = partition((page) => {
      return paths.includes(page);
    }, options.onlyPages);

    if (unknown.length) {
      context.logger.event({
        type: 'warning',
        event: 'COMMAND:STATIC:UNKNOWN_PAGES',
        message: `message: some of defined pages are not found`,
        payload: {
          unknownPages: unknown,
          existedPages: paths,
        },
      });
    }

    paths = existed;
  } else if (process.env.TRAMVAI_FORCE_CLIENT_SIDE_RENDERING === 'true') {
    // implicit connection with packages/modules/page-render-mode/src/ForceCSRModule.ts
    paths = ['/__csr_fallback__/'];
  }

  context.logger.event({
    type: 'debug',
    event: 'COMMAND:STATIC:GENERATE',
    message: `message: routes fetched, generate pages`,
  });

  await generateStatic(context, options, serverConfigManager, paths);

  context.logger.event({
    type: 'debug',
    event: 'COMMAND:STATIC:CLOSE_SERVER',
    message: `message: pages generated, close application server`,
  });

  // TODO silent kill if serve flag enabled
  server.kill();

  context.logger.event({
    type: 'debug',
    event: 'COMMAND:STATIC:SERVER_CLOSED',
    message: `message: server closed successfully`,
  });

  if (options.serve) {
    await new Promise<void>((resolve) => {
      server.on('exit', () => resolve());
    });

    const htmlServer = await startServer(serverConfigManager);

    await new Promise<void>((resolve) => {
      htmlServer.on('exit', () => {
        staticServer.close(() => resolve());
      });
    });
  } else {
    staticServer.close();
  }

  await portManager.cleanup();

  return {
    status: 'ok',
    message: 'application static generate success',
  };
};
