import inspector from 'node:inspector';
import { Worker } from 'node:worker_threads';
import { ConfigService } from '@tramvai/api/lib/config';
import { logger } from '@tramvai/api/lib/services/logger';
import {
  EXIT,
  INVALIDATE,
  INVALIDATE_DONE,
  PROGRESS,
  WebpackWorkerData,
  WebpackWorkerIncomingEventsPayload,
  WebpackWorkerOutgoingEventsPayload,
} from '../workers/webpack.events';
import { ProgressBar } from '../utils/progress-bar';
import { filterWorkerStderr } from '../utils/filter';

export class WebpackWorkerBridge {
  #worker: Worker | null = null;
  #workerPath: string;
  #workerData: WebpackWorkerData;
  #config: ConfigService;
  #progressBar: ProgressBar;

  constructor({
    config,
    workerPath,
    progressBar,
    workerData,
  }: {
    config: ConfigService;
    workerPath: string;
    progressBar: ProgressBar;
    workerData: WebpackWorkerData;
  }) {
    this.#progressBar = progressBar;
    this.#workerPath = workerPath;
    this.#workerData = workerData;
    this.#config = config;
  }

  create() {
    // watchpack issue - https://github.com/webpack/watchpack/issues/222, https://github.com/vercel/next.js/pull/51826
    const env: Record<string, string> = {
      WATCHPACK_WATCHER_LIMIT: '20',
      // force color output for worker - https://github.com/chalk/supports-color#info
      FORCE_COLOR: '1',
    };

    if ('NODE_TLS_REJECT_UNAUTHORIZED' in process.env) {
      env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED!;
    }
    if (process.env.TRAMVAI_CPU_PROFILE) {
      env.TRAMVAI_CPU_PROFILE = process.env.TRAMVAI_CPU_PROFILE;
      env.__TRAMVAI_CPU_PROFILE_FILENAME = `tramvai.${this.#workerData.type}-${this.#workerData.target}-webpack-worker`;
    }
    if (process.env.TRAMVAI_INSPECT_THREAD_LOADER) {
      env.TRAMVAI_INSPECT_THREAD_LOADER = process.env.TRAMVAI_INSPECT_THREAD_LOADER;
    }
    if (process.env.TRAMVAI_THREAD_LOADER_WARMUP_DISABLED) {
      env.TRAMVAI_THREAD_LOADER_WARMUP_DISABLED = process.env.TRAMVAI_THREAD_LOADER_WARMUP_DISABLED;
    }
    if (process.env.TRAMVAI_THREAD_LOADER_WORKERS) {
      env.TRAMVAI_THREAD_LOADER_WORKERS = process.env.TRAMVAI_THREAD_LOADER_WORKERS;
    }
    if (this.#config.inspectBuildProcess) {
      const inspectPort = this.#workerData.target === 'client' ? '9227' : '9228';

      env.INSPECT_WORKER_THREAD = 'break';
      env.INSPECT_WORKER_THREAD_PORT = inspectPort;
    }

    if (process.env.TRAMVAI_LOG_LEVEL) {
      env.TRAMVAI_LOG_LEVEL = process.env.TRAMVAI_LOG_LEVEL;
    }

    this.#worker = new Worker(this.#workerPath, {
      workerData: {
        ...this.#workerData,
        extraConfiguration: {
          projects: this.#workerData.extraConfiguration.projects,
          // pass only serializable plugins
          plugins: this.#workerData.extraConfiguration.plugins
            ? this.#workerData.extraConfiguration.plugins.filter(
                (plugin) => typeof plugin === 'string'
              )
            : [],
        },
      },
      name: `${this.#workerData.target} webpack`,
      env,
      stderr: !this.#config.verboseLogging,
      // if `process.execArgv` inherited from main thread, with `--inspect-brk` flag, current thread will be stucked
      execArgv: [],
      // `--inspect` and `--inspect-brk` for `worker_threads` only in Node.js >= 24.1 - https://github.com/nodejs/node/pull/56759
      // execArgv:
      //   this.#config.inspectBuildProcess
      //     ? ['--inspect-brk', `--inspect=${inspectPort}`]
      //     : [],
    });

    if (!this.#config.verboseLogging) {
      filterWorkerStderr(this.#worker);
    }

    this.#worker.on('error', (error) => {
      logger.event({
        type: 'info',
        event: 'webpack-worker-bridge',
        message: `${this.#workerData.target} worker error`,
        payload: { error },
      });
    });

    if (this.#config.showProgress) {
      this.subscribe(PROGRESS, (message) => {
        this.#progressBar[message.type](message.state);
      });
    }

    this.#worker.on('exit', (code) => {
      if (code !== 0) {
        logger.event({
          type: 'info',
          event: 'webpack-worker-bridge',
          message: `${this.#workerData.target} worker exit`,
          payload: { code },
        });
      }
    });
  }

  async invalidate() {
    if (this.#worker) {
      await new Promise<void>((resolve) => {
        this.#worker!.once('message', (data) => {
          if (data.event === INVALIDATE_DONE) {
            resolve();
          }
        });

        this.#worker!.postMessage({
          event: INVALIDATE,
        } as WebpackWorkerIncomingEventsPayload['invalidate']);
      });
    }
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
        } as WebpackWorkerIncomingEventsPayload['exit']);
      });
    }
  }

  subscribe<Event extends keyof WebpackWorkerOutgoingEventsPayload>(
    event: Event,
    handler: (data: WebpackWorkerOutgoingEventsPayload[Event]) => void
  ) {
    this.#worker?.on(
      'message',
      (data: WebpackWorkerOutgoingEventsPayload[keyof WebpackWorkerOutgoingEventsPayload]) => {
        if (data.event === event) {
          handler(data as WebpackWorkerOutgoingEventsPayload[Event]);
        }
      }
    );
  }
}
