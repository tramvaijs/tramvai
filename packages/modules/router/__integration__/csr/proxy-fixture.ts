import http from 'node:http';
import httpProxy from 'http-proxy';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import { WorkerFixture } from '@playwright/test';
import { CreateApp } from '@tramvai/internal-test-utils/fixtures/create-app';

export type ProxyServer = {
  port: number;
  server: http.Server;
};

const startHttpProxyServer = async ({
  sourcePort,
  targetPort,
}: {
  sourcePort?: number;
  targetPort: number;
}) => {
  const port = sourcePort ?? getPort() + 1;
  const proxy = httpProxy.createProxyServer();

  const proxyServer = http
    .createServer(function (req: any, res: any) {
      req.url = '/__csr_fallback__/';
      proxy.web(req, res, {
        target: `http://localhost:${targetPort}`,
      });
    })
    .listen(port);

  return {
    port,
    proxy: proxyServer,
  };
};

export const proxyHttpServerFixture: [
  WorkerFixture<ProxyServer, { createApp: CreateApp.CreateCustomApp }>,
  { scope: 'worker'; timeout: number },
] = [
  async ({ createApp }, use) => {
    const { port, proxy } = await startHttpProxyServer({
      targetPort: Number(new URL(createApp.serverUrl).port),
    });

    await use({ port, server: proxy });

    proxy.close();
  },
  { scope: 'worker', timeout: 60000 },
];
