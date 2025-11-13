import '../utils/inspector';
// speed up sequential server.js compilations after restarts
import '@tramvai/api/lib/utils/compile-cache';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { Module } from 'node:module';
import { logger } from '@tramvai/api/lib/services/logger';
import { AddressInfo, Server } from 'node:net';
import { subscribe, unsubscribe } from 'node:diagnostics_channel';
import {
  APPLICATION_SERVER_STARTED,
  APPLICATION_SERVER_START_FAILED,
  COMPILE,
  ServerRunnerIncomingEventsPayload,
  ServerRunnerOutgoingEventsPayload,
} from './server-runner.events';
import { EXIT } from './webpack.events';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

const requireFromString = (code: string, filename: string) => {
  // @ts-expect-error
  const newModule = new Module(filename, module.parent);

  newModule.filename = filename;
  newModule.paths = (Module as any)._nodeModulePaths(path.dirname(filename));
  (newModule as any)._compile(code, filename);

  return newModule.exports;
};

interface NetServerListenAsyncEndMessage {
  server: Server;
}

const originalAddress = Server.prototype.address;
const originalListen = Server.prototype.listen;
const initListenHandler = (onListen: (port: number | undefined) => void) => {
  const listenHandler = (msg: unknown) => {
    const address = <AddressInfo>(<NetServerListenAsyncEndMessage>msg).server.address();
    const { port } = address;

    onListen(port);
    unsubscribe('tracing:net.server.listen:asyncEnd', listenHandler);
  };

  subscribe('tracing:net.server.listen:asyncEnd', listenHandler);
};

// Monkeypatch server listen method for correct log of started server port
function monkeyPatchPort(actualPort: number) {
  const proxyPort = process.env.PORT;

  Server.prototype.listen = function listen(
    this: Server & { __tramvai_cli_port: number },
    opts?: any,
    ...args
  ) {
    if (Number(opts?.port ?? opts) === Number(proxyPort)) {
      this.__tramvai_cli_port = opts.port;
      // @ts-ignore
      return originalListen.call(this, { ...opts, port: actualPort }, ...args);
    }

    // @ts-ignore
    return originalListen.call(this, opts, ...args);
  };

  Server.prototype.address = function address(this: Server & { __tramvai_cli_port: number }) {
    const addr = <AddressInfo>originalAddress.call(this);

    if (typeof this.__tramvai_cli_port !== 'undefined') {
      return {
        ...addr,
        __tramvai_cli_port: addr.port,
        port: Number(actualPort),
      };
    }

    return addr;
  };
}

async function runServer() {
  const { port, proxyPort, disableServerRunnerWaiting } = workerData;
  process.env.PORT = String(proxyPort);

  monkeyPatchPort(port);
  initListenHandler((startedPort) => {
    if (Number(port) === startedPort) {
      parentPort!.postMessage({
        event: APPLICATION_SERVER_STARTED,
      } as ServerRunnerOutgoingEventsPayload['application-server-started']);
    }
  });

  parentPort?.on(
    'message',
    (message: ServerRunnerIncomingEventsPayload[keyof ServerRunnerIncomingEventsPayload]) => {
      switch (message.event) {
        case COMPILE: {
          try {
            // TODO: real filename
            requireFromString(message.code, 'server.js');

            if (disableServerRunnerWaiting) {
              parentPort!.postMessage({
                event: APPLICATION_SERVER_STARTED,
              } as ServerRunnerOutgoingEventsPayload['application-server-started']);
            }

            logger.event({
              type: 'debug',
              event: 'server-runner-worker',
              message: 'Application code executed successfully',
            });
          } catch (error) {
            logger.event({
              type: 'error',
              event: 'server-runner-worker',
              message: 'Application code execution failed',
              payload: { error, code: message.code },
            });

            parentPort!.postMessage({
              event: APPLICATION_SERVER_START_FAILED,
            } as ServerRunnerOutgoingEventsPayload['application-server-start-failed']);
          }
          break;
        }
        case EXIT: {
          process.exit(0);
          break;
        }
      }
    }
  );
}

runServer();

process.on('unhandledRejection', (error) => {
  logger.event({
    type: 'error',
    event: 'server-runner-worker',
    message: 'unhandledRejection',
    payload: { error },
  });

  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.event({
    type: 'error',
    event: 'server-runner-worker',
    message: 'uncaughtException',
    payload: { error },
  });

  process.exit(1);
});

async function runExitHandlersAndQuit(code: number) {
  if (code !== 0) {
    logger.event({
      type: 'error',
      event: 'server-runner-worker',
      message: 'exit',
      payload: { code },
    });
  }

  // TODO: restart build process / just log?

  if (global.__TRAMVAI_EXIT_HANDLERS__) {
    await Promise.allSettled(global.__TRAMVAI_EXIT_HANDLERS__.map((handler) => handler()));
  }
  process.exit(code);
}

process.on('exit', async (code) => runExitHandlersAndQuit(code));
