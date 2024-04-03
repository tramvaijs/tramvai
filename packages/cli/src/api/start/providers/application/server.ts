import type { Provider } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import { readFileSync } from 'fs';
import { createProxyServer } from 'http-proxy';
import { INIT_HANDLER_TOKEN, CLOSE_HANDLER_TOKEN } from '../../tokens';
import {
  CONFIG_MANAGER_TOKEN,
  SELF_SIGNED_CERTIFICATE_TOKEN,
  SERVER_TOKEN,
} from '../../../../di/tokens';
import { stopServer } from '../../utils/stopServer';
import { createServer } from '../../utils/createServer';
import { listenServer } from '../../utils/listenServer';

export const serverProviders: readonly Provider[] = [
  provide({
    provide: SERVER_TOKEN,
    useFactory: ({ selfSignedCertificate }) => {
      return createServer(selfSignedCertificate);
    },
    deps: {
      selfSignedCertificate: {
        token: SELF_SIGNED_CERTIFICATE_TOKEN,
        optional: true,
      },
    },
  }),
  provide({
    provide: INIT_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ server, configManager, selfSignedCertificate }) => {
      return async function staticServerListen() {
        const { https } = configManager;
        const port = https && configManager.host !== '0.0.0.0' ? 443 : configManager.port;
        const host = https ? '0.0.0.0' : configManager.host;

        await listenServer(server, host, port);
      };
    },
    deps: {
      server: SERVER_TOKEN,
      configManager: CONFIG_MANAGER_TOKEN,
      selfSignedCertificate: SELF_SIGNED_CERTIFICATE_TOKEN,
    },
  }),
  provide({
    provide: CLOSE_HANDLER_TOKEN,
    multi: true,
    useFactory: ({ server }) => {
      return () => {
        return stopServer(server);
      };
    },
    deps: {
      server: SERVER_TOKEN,
    },
  }),
] as const;
