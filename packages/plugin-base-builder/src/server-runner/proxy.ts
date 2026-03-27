import http, { RequestListener } from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import httpProxy from 'http-proxy';
import { ExtractDependencyType } from '@tinkoff/dippy';

import { logger } from '@tramvai/api/lib/services/logger';
import { CompilationWatcher } from '../utils/compilation-watcher';
import { SELF_SIGNED_CERTIFICATE_TOKEN } from '../utils/selfSignedCertificate';

type SelfSignedCertificate = ExtractDependencyType<typeof SELF_SIGNED_CERTIFICATE_TOKEN>;

function createServer(selfSignedCertificate: SelfSignedCertificate, handler: RequestListener) {
  return selfSignedCertificate
    ? https.createServer(
        {
          cert: fs.readFileSync(selfSignedCertificate.certificatePath, 'utf8'),
          key: fs.readFileSync(selfSignedCertificate.keyPath, 'utf8'),
        },
        handler
      )
    : http.createServer(handler);
}

export const createProxy = ({
  port,
  staticPort,
  serverRunnerPort,
  serverBuildPort,
  selfSignedCertificate,
  browserBuildPort,
  hostname,
  compilationWatcher,
}: {
  port: number;
  hostname: string;
  staticPort: number;
  selfSignedCertificate: SelfSignedCertificate;
  serverRunnerPort: number;
  serverBuildPort: number;
  browserBuildPort: number;
  compilationWatcher: CompilationWatcher;
}) => {
  const devProxy = httpProxy.createProxyServer({
    ws: true,
  });

  devProxy.on('error', async (error, req, res) => {
    if (compilationWatcher.isCompilationInProgress()) {
      await compilationWatcher.waitCompilation();

      devProxy.web(req, res as any, {
        target: `http://localhost:${serverRunnerPort}`,
      });
    } else {
      logger.event({
        type: 'error',
        event: 'dev-proxy',
        message: `proxy error`,
        payload: {
          error,
          url: req.url,
        },
      });

      // @ts-expect-error
      res.statusCode = 500;
      res.end();
    }
  });

  const devServer = createServer(selfSignedCertificate, (req, res) => {
    // TODO: HTML
    devProxy.web(req, res, {
      target: `http://localhost:${serverRunnerPort}`,
    });
  });

  const staticServer = createServer(selfSignedCertificate, (req, res) => {
    if (req.url!.includes('/server.js')) {
      devProxy.web(req, res, {
        target: `http://localhost:${serverBuildPort}`,
      });
    } else {
      devProxy.web(req, res, {
        target: `http://localhost:${browserBuildPort}`,
      });
    }
  });

  devServer.on('upgrade', (req, socket, head) => {
    devProxy.ws(req, socket, head, {
      target: `ws://localhost:${browserBuildPort}`,
    });
  });

  return {
    server: devServer,
    staticServer,
    listen: () => {
      return Promise.all([
        new Promise<void>((resolve) => {
          devServer.listen(port, hostname, () => {
            logger.event({
              type: 'info',
              event: 'dev-proxy',
              message: `Development server started at ${port} port`,
            });
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          staticServer.listen(staticPort, () => {
            logger.event({
              type: 'info',
              event: 'dev-proxy',
              message: `Static server started at ${staticPort} port`,
            });
            resolve();
          });
        }),
      ]);
    },
    close: () => {
      return Promise.all([
        // devProxy.listen method is not called so close callback is not required
        devProxy.close(),
        new Promise<void>((resolve) => {
          devServer.close(() => {
            resolve();
          });
          setTimeout(() => {
            resolve();
          }, 1000);
        }),
        new Promise<void>((resolve) => {
          staticServer.close(() => {
            resolve();
          });
          setTimeout(() => {
            resolve();
          }, 1000);
        }),
      ]);
    },
  };
};
