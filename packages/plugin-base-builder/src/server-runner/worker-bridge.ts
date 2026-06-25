import inspector from 'node:inspector';
import { Worker } from 'node:worker_threads';

import { ConfigService } from '@tramvai/api/lib/config';
import { logger } from '@tramvai/api/lib/services/logger';
import { filterWorkerStderr } from '../utils/filter';

import {
  APPLICATION_SERVER_STARTED,
  APPLICATION_SERVER_START_FAILED,
  COMPILE,
  EXIT,
  RELOAD,
  ServerRunnerIncomingEventsPayload,
  ServerRunnerOutgoingEventsPayload,
} from './events';

export type ServerRunnerWorkerData = {
  port: number;
  env?: Record<string, string>;
  proxyPort: number;
  disableServerRunnerWaiting: boolean;
  serverPath: string;
  sourceMap: boolean;
  cwd: string;
  hotReload?: boolean;
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
      ...this.#config.runtimeEnv,
      HOST: this.#config.host,
      PORT: this.#config.port?.toString(),
      HOST_STATIC: `${this.#config.staticHost}`,
      PORT_STATIC: `${this.#config.staticPort}`,
      // force color output for worker - https://github.com/chalk/supports-color#info
      FORCE_COLOR: '1',
    };

    if (this.#config.debug) {
      env.INSPECT_WORKER_THREAD = this.#config.debug;
      env.INSPECT_WORKER_THREAD_PORT = '9229';
    }
    if (process.env.TRAMVAI_CPU_PROFILE) {
      env.TRAMVAI_CPU_PROFILE = process.env.TRAMVAI_CPU_PROFILE;
      env.__TRAMVAI_CPU_PROFILE_FILENAME = `tramvai.server-runner-worker`;
    }

    this.#worker = new Worker(this.#workerPath, {
      workerData: this.#workerData,
      name: 'server runner',
      env,
      stderr: !this.#config.verboseLogging,
      // if `process.execArgv` inherited from main thread, with `--inspect-brk` flag, current thread will be stucked
      execArgv: this.#config.serverSourceMap ? ['--enable-source-maps'] : [],
      // `--inspect` and `--inspect-brk` for `worker_threads` only in Node.js >= 24.1 - https://github.com/nodejs/node/pull/56759
      // execArgv:
      //   process.env.TRAMVAI_DEBUG || this.#config.debug
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

  async reload(payload: { code: string }) {
    return new Promise<void>((resolve, reject) => {
      this.#worker?.once(
        'message',
        (data: ServerRunnerOutgoingEventsPayload[keyof ServerRunnerOutgoingEventsPayload]) => {
          if (data.event === APPLICATION_SERVER_STARTED) {
            resolve();
          }

          if (data.event === APPLICATION_SERVER_START_FAILED) {
            reject();
          }
        }
      );

      this.#worker?.postMessage({
        event: RELOAD,
        code: payload.code,
      } as ServerRunnerIncomingEventsPayload['reload']);
    });
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
