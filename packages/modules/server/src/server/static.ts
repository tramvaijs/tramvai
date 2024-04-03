import fastify from 'fastify';
import fastifyCompress from '@fastify/compress';
import { fastifyStatic } from '@fastify/static';
import type { LOGGER_TOKEN, ENV_MANAGER_TOKEN } from '@tramvai/module-common';
import type { APP_INFO_TOKEN } from '@tramvai/core';
import os from 'os';

const DEFAULT_STATIC_HOST = 'localhost';

export const staticAppCommand = ({
  logger,
  envManager,
  appInfo,
}: {
  logger: typeof LOGGER_TOKEN;
  envManager: typeof ENV_MANAGER_TOKEN;
  appInfo: typeof APP_INFO_TOKEN;
}) => {
  if (!envManager.get('DEV_STATIC')) {
    return async function staticAppNoop() {};
  }

  const log = logger('server:static');
  const port = +envManager.get('PORT_STATIC');
  const host = (envManager.get('HOST_STATIC') ?? DEFAULT_STATIC_HOST).replace(
    'localhost',
    '0.0.0.0'
  );
  const appVersion = envManager.get('APP_VERSION');

  return async function staticApp() {
    const appStatic = fastify();

    await appStatic.register(fastifyCompress);

    await appStatic.register(fastifyStatic, {
      root: process.cwd(),
      prefix: '/',
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Timing-Allow-Origin', '*');
        res.setHeader('X-App-Id', appInfo.appName);
        res.setHeader('X-App-Version', appVersion);
        res.setHeader('X-Host', os.hostname());
      },
    });
    appStatic.listen({ host, port }, () => log.info(`Running static server on ${host}:${port}`));

    return appStatic;
  };
};
