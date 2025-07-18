import inspector from 'node:inspector';
import { Worker } from 'node:worker_threads';
import { ConfigService } from '@tramvai/api/lib/config';
import {
  EXIT,
  PROGRESS,
  WebpackWorkerData,
  WebpackWorkerIncomingEventsPayload,
  WebpackWorkerOutgoingEventsPayload,
} from '../workers/webpack.events';
import { ProgressBar } from '../utils/progress-bar';

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
    };

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
    if (process.env.TRAMVAI_INSPECT_BUILD_PROCESS || this.#config.inspectBuildProcess) {
      const inspectPort = this.#workerData.target === 'client' ? '9227' : '9228';

      env.INSPECT_WORKER_THREAD = 'break';
      env.INSPECT_WORKER_THREAD_PORT = inspectPort;
    }

    this.#worker = new Worker(this.#workerPath, {
      workerData: this.#workerData,
      name: `${this.#workerData.target} webpack`,
      env,
      // if `process.execArgv` inherited from main thread, with `--inspect-brk` flag, current thread will be stucked
      execArgv: [],
      // `--inspect` and `--inspect-brk` for `worker_threads` only in Node.js >= 24.1 - https://github.com/nodejs/node/pull/56759
      // execArgv:
      //   process.env.TRAMVAI_INSPECT_BUILD_PROCESS || this.#config.inspectBuildProcess
      //     ? ['--inspect-brk', `--inspect=${inspectPort}`]
      //     : [],
    });

    this.#worker.on('error', (err) => {
      // TODO: replace with logger from di?
      // eslint-disable-next-line no-console
      console.log(`[webpack-worker-bridge] ${this.#workerData.target} worker error`, err);
    });

    if (this.#config.showProgress) {
      this.subscribe(PROGRESS, (message) => {
        this.#progressBar[message.type](message.state);
      });
    }

    this.#worker.on('exit', (code) => {
      if (code !== 0) {
        // TODO: replace with logger from di?
        // eslint-disable-next-line no-console
        console.log(`[webpack-worker-bridge] ${this.#workerData.target} worker exit`, code);
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
