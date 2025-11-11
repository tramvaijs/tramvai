import type { Server } from 'node:http';
import { createToken } from '@tinkoff/dippy';

export type BuildStats = {
  maxMemoryRss?: number;
  buildTime: number;
};

export type DevServer = {
  close(): Promise<void>;
  invalidate(): Promise<void>;
  getStats(): {
    client: BuildStats;
    server: BuildStats;
  };
  buildPromise: Promise<void>;
  port: number;
  staticPort: number;
  httpServer?: Server;
  staticHttpServer?: Server;
};

export const DEV_SERVER_TOKEN = createToken<DevServerApi>('tramvai dev-server');

export const DEV_SERVER_CLOSE_HANDLER_TOKEN = createToken<(() => void) | (() => Promise<void>)>(
  'tramvai dev-server close handler',
  { multi: true }
);

export interface DevServerApi {
  start(): Promise<DevServer>;
}
