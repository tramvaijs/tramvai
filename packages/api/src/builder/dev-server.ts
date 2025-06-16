import { createToken } from '@tinkoff/dippy';

export type DevServer = {
  close(): Promise<void>;
  buildPromise: Promise<void>;
  port: number;
  staticPort: number;
};

export const DEV_SERVER_TOKEN = createToken<DevServerApi>('tramvai dev-server');

export const DEV_SERVER_CLOSE_HANDLER_TOKEN = createToken<(() => void) | (() => Promise<void>)>(
  'tramvai dev-server close handler',
  { multi: true }
);

export interface DevServerApi {
  start(): Promise<DevServer>;
}
