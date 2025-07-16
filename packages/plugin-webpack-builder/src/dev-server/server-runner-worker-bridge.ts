import inspector from 'node:inspector';
import { Worker } from 'node:worker_threads';
import { ConfigService } from '@tramvai/api/lib/config';
import {
  APPLICATION_SERVER_STARTED,
  COMPILE,
  EXIT,
  ServerRunnerIncomingEventsPayload,
  ServerRunnerOutgoingEventsPayload,
} from '../workers/server-runner.events';

export type ServerRunnerkWorkerData = {
  port: number;
};

export class ServerRunnerWorkerBridge {
  #worker: Worker | null = null;
  #workerPath: string;
  #workerData: ServerRunnerkWorkerData;
  #config: ConfigService;

  constructor({
    config,
    workerPath,
    workerData,
  }: {
    config: ConfigService;
    workerPath: string;
    workerData: ServerRunnerkWorkerData;
  }) {
    this.#workerPath = workerPath;
    this.#workerData = workerData;
    this.#config = config;
  }

  create() {
    const env: Record<string, string | undefined> = {
      ...process.env,
    };

    if (process.env.TRAMVAI_INSPECT_SERVER_RUNTIME || this.#config.inspectServerRuntime) {
      env.INSPECT_WORKER_THREAD = 'break';
      env.INSPECT_WORKER_THREAD_PORT = '9229';
    }

    this.#worker = new Worker(this.#workerPath, {
      workerData: this.#workerData,
      name: 'server runner',
      env,
      // if `process.execArgv` inherited from main thread, with `--inspect-brk` flag, current thread will be stucked
      execArgv: [],
      // `--inspect` and `--inspect-brk` for `worker_threads` only in Node.js >= 24.1 - https://github.com/nodejs/node/pull/56759
      // execArgv:
      //   process.env.TRAMVAI_INSPECT_SERVER_RUNTIME || this.#config.inspectServerRuntime
      //     ? ['--inspect-brk', `--inspect=9229`]
      //     : [],
    });

    this.#worker.on('error', (err) => {
      // TODO: replace with logger from di?
      // eslint-disable-next-line no-console
      console.log(`[server-runner-worker-bridge] worker error`, err);
    });

    this.#worker.on('exit', (code) => {
      if (code !== 0) {
        // TODO: replace with logger from di?
        // eslint-disable-next-line no-console
        console.log(`[server-runner-worker-bridge] worker exit`, code);
      }
    });
  }

  async destroy() {
    if (this.#worker) {
      await new Promise<void>((resolve) => {
        let terminateTimeout: NodeJS.Timeout;

        if (inspector.url()) {
          // if `inspector.waitForDebugger()` is used in worker, and debugger is not attached, worker will be unresponsive for messages
          // otherwise, worker need to be terminated gracefully with "EXIT" message
          terminateTimeout = setTimeout(() => {
            // eslint-disable-next-line promise/catch-or-return
            this.#worker!.terminate().then(() => {
              resolve();
            });
          }, 5000);
        }

        this.#worker!.once('exit', () => {
          clearTimeout(terminateTimeout);
          this.#worker = null;
          resolve();
        });

        this.#worker!.postMessage({
          event: EXIT,
        } as ServerRunnerIncomingEventsPayload['exit']);
      });
    }
  }

  async compile(payload: { code: string }) {
    return new Promise<void>((resolve) => {
      this.#worker?.once(
        'message',
        (data: ServerRunnerOutgoingEventsPayload[keyof ServerRunnerOutgoingEventsPayload]) => {
          if (data.event === APPLICATION_SERVER_STARTED) {
            resolve();
          }
        }
      );

      this.#worker?.postMessage({
        event: COMPILE,
        code: payload.code,
      } as ServerRunnerIncomingEventsPayload['compile']);
    });
  }
}
