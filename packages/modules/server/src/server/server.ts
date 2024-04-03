import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';
import type { SERVER_TOKEN } from '@tramvai/tokens-server';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { ENV_MANAGER_TOKEN } from '@tramvai/module-environment';

export const serverFactory = () => {
  const httpsOptions = JSON.parse(process.env.HTTPS ?? null);
  if (httpsOptions && httpsOptions.key && httpsOptions.cert) {
    return https.createServer({
      key: readFileSync(httpsOptions.key),
      cert: readFileSync(httpsOptions.cert),
    });
  }
  return http.createServer();
};

export const serverListenCommand = ({
  server,
  logger,
  envManager,
}: {
  server: typeof SERVER_TOKEN;
  logger: typeof LOGGER_TOKEN;
  envManager: typeof ENV_MANAGER_TOKEN;
}) => {
  const log = logger('server');
  const port = envManager.get('PORT');
  const host = envManager.get('HOST');

  return function serverListen() {
    server.listen(
      {
        host,
        port,
      },
      () => log.warn({ event: 'server-listen-port', message: `Server listen ${port} port` })
    );
  };
};
