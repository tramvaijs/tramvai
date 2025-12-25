import inspector from 'node:inspector';
import { Worker } from 'node:worker_threads';
import { ConfigService } from '@tramvai/api/lib/config';
import { logger } from '@tramvai/api/lib/services/logger';
import {
  APPLICATION_SERVER_STARTED,
  APPLICATION_SERVER_START_FAILED,
  COMPILE,
  EXIT,
  ServerRunnerIncomingEventsPayload,
  ServerRunnerOutgoingEventsPayload,
} from '../workers/server-runner.events';
import { filterWorkerStderr } from '../utils/filter';

export type ServerRunnerWorkerData = {
  port: number;
  proxyPort: number;
  disableServerRunnerWaiting: boolean;
};

export class ServerRunnerWorkerBridge {
  #worker: Worker | null = null;
  #workerPath: string;
  #workerData: ServerRunnerWorkerData;
  #config: ConfigService;

  constructor({
    config,
    workerPath,
    workerData,
  }: {
    config: ConfigService;
    workerPath: string;
    workerData: ServerRunnerWorkerData;
  }) {
    this.#workerPath = workerPath;
    this.#workerData = workerData;
    this.#config = config;
  }

  create() {
    const env: Record<string, string | undefined> = {
      ...process.env,
      HOST: this.#config.host,
      PORT: this.#config.port?.toString(),
      // force color output for worker - https://github.com/chalk/supports-color#info
      FORCE_COLOR: '1',
    };

    if (process.env.TRAMVAI_INSPECT_SERVER_RUNTIME || this.#config.inspectServerRuntime) {
      env.INSPECT_WORKER_THREAD = 'break';
      env.INSPECT_WORKER_THREAD_PORT = '9229';
    }

    this.#worker = new Worker(this.#workerPath, {
      workerData: this.#workerData,
      name: 'server runner',
      env,
      stderr: !this.#config.verboseLogging,
      // if `process.execArgv` inherited from main thread, with `--inspect-brk` flag, current thread will be stucked
      execArgv: [],
      // `--inspect` and `--inspect-brk` for `worker_threads` only in Node.js >= 24.1 - https://github.com/nodejs/node/pull/56759
      // execArgv:
      //   process.env.TRAMVAI_INSPECT_SERVER_RUNTIME || this.#config.inspectServerRuntime
      //     ? ['--inspect-brk', `--inspect=9229`]
      //     : [],
    });

    if (!this.#config.verboseLogging) {
      filterWorkerStderr(this.#worker);
    }

    this.#worker.on('error', (error) => {
      logger.event({
        type: 'info',
        event: 'server-runner-worker-bridge',
        message: `Worker error`,
        payload: { error },
      });
    });

    this.#worker.on('exit', (code) => {
      if (code !== 0) {
        logger.event({
          type: 'info',
          event: 'server-runner-worker-bridge',
          message: `Worker exit`,
          payload: { code },
        });
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
    return new Promise<void>((resolve, reject) => {
      this.#worker?.once(
        'message',
        (data: ServerRunnerOutgoingEventsPayload[keyof ServerRunnerOutgoingEventsPayload]) => {
          if (data.event === APPLICATION_SERVER_STARTED) {
            resolve();
          }

          if (data.event === APPLICATION_SERVER_START_FAILED) {
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
