import http, { RequestListener } from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import httpProxy from 'http-proxy';
import { ExtractDependencyType } from '@tinkoff/dippy';
// @ts-ignore
// eslint-disable-next-line no-restricted-imports
import webOutgoing from 'http-proxy/lib/http-proxy/passes/web-outgoing';
import eachObj from '@tinkoff/utils/object/each';
// @ts-ignore - no types for package this version
import { v5 as uuidv5 } from 'uuid';

import { logger } from '@tramvai/api/lib/services/logger';
import { CompilationWatcher } from '../utils/compilation-watcher';
import { SELF_SIGNED_CERTIFICATE_TOKEN } from '../utils/selfSignedCertificate';

type SelfSignedCertificate = ExtractDependencyType<typeof SELF_SIGNED_CERTIFICATE_TOKEN>;

const DEVTOOLS_ROUTE = '/.well-known/appspecific/com.chrome.devtools.json';
const STABLE_UUID = '7d3d2a18-2cf5-4b9f-b9f5-6b6e1d7f8f52';

let projectUuid: string | undefined;

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
  hostname,
  rootDir,
  staticPort,
  staticHost,
  serverRunnerPort,
  serverBuildPort,
  selfSignedCertificate,
  browserBuildPort,
  compilationWatcher,
}: {
  port: number;
  hostname: string;
  rootDir: string;
  staticPort: number;
  staticHost: string;
  selfSignedCertificate: SelfSignedCertificate;
  serverRunnerPort: number;
  serverBuildPort: number;
  browserBuildPort: number;
  compilationWatcher: CompilationWatcher;
}) => {
  const devProxy = httpProxy.createProxyServer({
    ws: true,
    selfHandleResponse: true,
  });

  // Early Hints support
  devProxy.on('proxyReq', (proxyReq, req, res) => {
    proxyReq.socket?.on('data', (data) => {
      try {
        const chunk = data.toString();

        if (chunk.startsWith('HTTP/1.1 103 Early Hints')) {
          res.socket?.write(data);
        }
      } catch (e) {
        // do nothing
      }
    });

    // http-proxy always collapses multiple slashes in the URL,
    // which is somewhat unexpected when working with the server directly
    // https://github.com/http-party/node-http-proxy/issues/775
    // so we try to restore all slashes back
    (proxyReq as any).path = req.url;
  });

  devProxy.on('proxyRes', (proxyRes, req, res) => {
    if (!res.headersSent) {
      // duplicate the entire proxy logic and send the response manually
      // a bit of a hack inspired by https://github.com/http-party/node-http-proxy/issues/1263#issuecomment-394758768
      eachObj((handler) => {
        handler(req, res, proxyRes, {});
      }, webOutgoing);
    }

    proxyRes.pipe(res);
  });

  devProxy.on('error', async (error, req, res) => {
    // if no compilation exists ignore all requests
    if (!compilationWatcher.compilationAlive) {
      // @ts-expect-error
      res.statusCode = 503;
      res.end();
      return;
    }

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
    if (req.url) {
      try {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === DEVTOOLS_ROUTE) {
          res.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          });

          if (!projectUuid) {
            // Use v5 and add path to uuid generation for uuid stability
            // /Users/project-a -> always same uuid
            projectUuid = uuidv5(rootDir, STABLE_UUID);
          }

          res.end(
            JSON.stringify({
              workspace: {
                root: rootDir,
                uuid: projectUuid,
              },
            })
          );

          return;
        }
      } catch (_err) {}
    }

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

  // WebSockets support for hot reload
  devServer.on('upgrade', (req, socket, head) => {
    // prevent uncaughtException when WS is not supported in application server
    socket.on('error', (err) => {
      console.error('[dev-server-error] websocket proxy error', err.message);
    });

    devProxy.ws(req, socket, head, {
      target: `ws://localhost:${browserBuildPort}`,
    });
  });

  return {
    server: devServer,
    staticServer,
    listen: () => {
      return Promise.all([
        new Promise<void>((resolve, reject) => {
          devServer.listen(port, hostname, () => {
            logger.event({
              type: 'info',
              event: 'dev-proxy',
              message: `Development server started at ${port} port`,
            });
            resolve();
          });

          devServer.on('error', (err: Error) => {
            reject(err);
          });
        }),

        new Promise<void>((resolve, reject) => {
          staticServer.listen(staticPort, staticHost.replace('localhost', '0.0.0.0'), () => {
            logger.event({
              type: 'info',
              event: 'dev-proxy',
              message: `Static server started at ${staticPort} port`,
            });
            resolve();
          });

          staticServer.on('error', (err: Error) => {
            reject(err);
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
