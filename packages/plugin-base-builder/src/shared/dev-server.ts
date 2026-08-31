import { ConfigService } from '@tramvai/api/lib/config';
import type { RequestHandler, Configuration as WebpackDevServerConfig } from 'webpack-dev-server';
import type { DevServer } from '@rspack/core';

import { BuildTarget } from '../types';

type devServerMap = {
  webpack: WebpackDevServerConfig;
  rspack: DevServer;
};

export const createDevServerOptions = <T extends keyof devServerMap>({
  config,
  buildPort,
  devServerPort,
  client = true,
  hot,
}: {
  config: ConfigService;
  buildPort: number;
  devServerPort: number;
  client?: boolean;
  hot: boolean | undefined;
}) => {
  const devServerOptions: WebpackDevServerConfig = {
    devMiddleware: {
      writeToDisk: config.writeToDisk,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Timing-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    },
    setupMiddlewares(middlewares, devServer) {
      middlewares.push({
        name: 'webpack-dev-server-assets-json',
        path: '/webpack-dev-server-json',
        middleware: ((req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            next();
            return;
          }

          if (!devServer!.middleware) {
            next();
            return;
          }

          devServer.middleware!.waitUntilValid((stats) => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');

            // HEAD requests should not return body content
            if (req.method === 'HEAD') {
              res.end();
              return;
            }

            const assetsList = [];

            /**
             * @type {StatsCompilation[]}
             */
            const statsForPrint =
              stats && 'stats' in stats ? stats.toJson().children : [stats?.toJson()];

            if (statsForPrint) {
              for (const [_, item] of statsForPrint.entries()) {
                if (item) {
                  const assets = item.assets ?? [];

                  for (const asset of assets) {
                    assetsList.push(asset.name);
                  }
                }
              }
            }

            res.type('json');
            res.json(assetsList);
          });
        }) satisfies RequestHandler,
      });

      return middlewares;
    },
    hot,
    // compressing server.js takes longer than request without compression
    compress: false,
    client: client
      ? {
          webSocketURL: {
            port: devServerPort,
          },
          overlay: {
            errors: true,
            warnings: false,
            runtimeErrors: true,
          },
        }
      : false,
    port: buildPort,
  };

  if (config.projectType === 'child-app') {
    devServerOptions.devMiddleware!.publicPath = `/${config.projectName}/`;
  }

  if (config.disableWebSocketServer || !config.liveReload) {
    devServerOptions.webSocketServer = false;
  }

  return devServerOptions as devServerMap[T];
};
