import '../utils/inspector';
// speed up sequential server.js compilations after restarts
import '@tramvai/api/lib/utils/compile-cache';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { Module } from 'node:module';
import { logger } from '@tramvai/api/lib/services/logger';
import {
  APPLICATION_SERVER_STARTED,
  COMPILE,
  ServerRunnerIncomingEventsPayload,
  ServerRunnerOutgoingEventsPayload,
} from './server-runner.events';
import { EXIT } from './webpack.events';

const requireFromString = (code: string, filename: string) => {
  // @ts-expect-error
  const newModule = new Module(filename, module.parent);

  newModule.filename = filename;
  newModule.paths = (Module as any)._nodeModulePaths(path.dirname(filename));
  (newModule as any)._compile(code, filename);

  return newModule.exports;
};

async function runServer() {
  const { port } = workerData;

  parentPort?.on(
    'message',
    (message: ServerRunnerIncomingEventsPayload[keyof ServerRunnerIncomingEventsPayload]) => {
      switch (message.event) {
        case COMPILE: {
          // TODO: show dev-server port in `server-listen-port` logs. Monkeypatch http server or pass another env?
          process.env.PORT = String(port);

          try {
            // TODO: real filename
            requireFromString(message.code, 'server.js');

            logger.event({
              type: 'debug',
              event: 'server-runner-worker',
              message: 'Application code executed successfully',
            });

            parentPort!.postMessage({
              event: APPLICATION_SERVER_STARTED,
            } as ServerRunnerOutgoingEventsPayload['application-server-started']);
          } catch (error) {
            logger.event({
              type: 'warning',
              event: 'server-runner-worker',
              message: 'Application code execution failed',
              payload: { error },
            });
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

process.on('exit', (code) => {
  if (code !== 0) {
    logger.event({
      type: 'error',
      event: 'server-runner-worker',
      message: 'exit',
      payload: { code },
    });
  }

  // TODO: restart build process / just log?

  process.exit(code);
});
