import type { WorkerFixture } from '@playwright/test';
import http from 'http';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';

export interface ApiServer {
  getPort: () => number;
  getUrls: () => string[];
  clearUrls: () => void;
}

export const apiServerFixture: [
  WorkerFixture<ApiServer, {}>,
  { scope: 'worker'; timeout: number },
] = [
  // eslint-disable-next-line no-empty-pattern
  async ({}, use) => {
    const port = await getPort();
    let urls: string[] = [];

    const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
      urls.push(req.url!);
      res.write('Ok');
      res.end();
    };

    const server = http.createServer(handler);
    const server6 = http.createServer(handler);

    await new Promise<void>((resolve) => server.listen(port, '0.0.0.0', resolve));
    await new Promise<void>((resolve) => server6.listen(port, '::1', resolve));

    await use({
      getPort: () => port,
      getUrls: () => urls,
      clearUrls: () => {
        urls = [];
      },
    });

    server.close();
    server6.close();
  },
  { scope: 'worker', timeout: 60000 },
];
