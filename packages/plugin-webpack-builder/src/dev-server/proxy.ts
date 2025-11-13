import http from 'node:http';
import httpProxy from 'http-proxy';
import { logger } from '@tramvai/api/lib/services/logger';
import type { CompilationWatcher } from '../utils/compilation-watcher';

export const createProxy = ({
  port,
  staticPort,
  serverRunnerPort,
  serverBuildPort,
  browserBuildPort,
  compilationWatcher,
}: {
  port: number;
  staticPort: number;
  serverRunnerPort: number;
  serverBuildPort: number;
  browserBuildPort: number;
  compilationWatcher: CompilationWatcher;
}) => {
  const devProxy = httpProxy.createProxyServer();

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

  const devServer = http.createServer((req, res) => {
    // TODO: HTML
    devProxy.web(req, res, {
      target: `http://localhost:${serverRunnerPort}`,
    });
  });
  const staticServer = http.createServer((req, res) => {
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

  return {
    httpServer: devServer,
    staticHttpServer: staticServer,
    listen: () => {
      return Promise.all([
        new Promise<void>((resolve) => {
          devServer.listen(port, () => {
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
