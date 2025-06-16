import '../utils/inspector';
// speed up sequential server.js compilations after restarts
import '@tramvai/api/lib/utils/compile-cache';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { Module } from 'node:module';
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

            // TODO: replace with logger from di?
            // eslint-disable-next-line no-console
            console.log(`[server-runner-worker] application code executed successfully`);
            parentPort!.postMessage({
              event: APPLICATION_SERVER_STARTED,
            } as ServerRunnerOutgoingEventsPayload['application-server-started']);
          } catch (error) {
            // TODO: replace with logger from di?
            // eslint-disable-next-line no-console
            console.log(`[server-runner-worker] application code execution failed`, error);
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
  // TODO: replace with logger from di?
  // eslint-disable-next-line no-console
  console.error(`[server-runner-worker] unhandledRejection`, error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  // TODO: replace with logger from di?
  // eslint-disable-next-line no-console
  console.error(`[server-runner-worker] uncaughtException`, error);
  process.exit(1);
});

process.on('exit', (code) => {
  // TODO: replace with logger from di?
  // eslint-disable-next-line no-console
  console.error(`[server-runner-worker] exit`, code);
  // TODO: restart build process / just log?
  process.exit(code);
});
