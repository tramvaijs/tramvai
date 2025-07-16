import { parentPort } from 'node:worker_threads';
import { Compiler, ProgressPlugin, Stats } from 'webpack';

import { PROGRESS, ProgressType } from '../../../workers/webpack.events';
import { parseRequest, prettyHrtime } from './utils';
import { ProgressState } from '../../../utils/progress-bar/types';

interface WorkerProgressPluginOptions {
  name: string;
  color: string;
}

function hook(compiler: Compiler, hookName: keyof Compiler['hooks'], fn: any) {
  compiler.hooks[hookName].tap(`WebpackBar: hookName`, fn);
}

const DEFAULT_STATE = () => ({
  start: null,
  progress: -1,
  done: false,
  message: '',
  details: [],
  request: null,
  hasErrors: false,
});

class WebpackBarProgressPlugin {
  state!: ProgressState;
  options: WorkerProgressPluginOptions;

  constructor(options: WorkerProgressPluginOptions) {
    this.options = options;
    this.state = {
      ...DEFAULT_STATE(),
      color: this.options.color,
      name: this.options.name,
    };
  }

  get hasRunning() {
    return !this.state.done;
  }

  get hasErrors() {
    return this.state.hasErrors;
  }

  updateProgress(percent = 0, message = '', details: string[] = []) {
    const progress = Math.floor(percent * 100);

    const activeModule = details.pop();

    // fix: https://github.com/unjs/webpackbar/issues/81
    if (this.state.done) {
      return;
    }

    Object.assign(this.state, {
      progress,
      message: message || '',
      details,
      request: parseRequest(activeModule),
    });

    this.callProgress();
  }

  sendEvent(type: ProgressType) {
    parentPort!.postMessage({ event: PROGRESS, type, state: this.state });
  }

  callProgress() {
    this.sendEvent('update');
  }

  callStart() {
    this.sendEvent('start');
  }

  callDone() {
    this.sendEvent('done');
  }

  apply(compiler: Compiler) {
    hook(compiler, 'done', (stats: Stats) => {
      // Prevent calling done twice
      if (this.state.done) {
        return;
      }

      const hasErrors = stats.hasErrors();
      const status = hasErrors ? 'with some errors' : 'successfully';

      const time = this.state.start
        ? ` in ${prettyHrtime(process.hrtime(this.state.start), 2)}`
        : '';

      Object.assign(this.state, {
        ...DEFAULT_STATE(),
        progress: 100,
        done: true,
        message: `Compiled ${status}${time}`,
        hasErrors,
      });

      this.callProgress();

      this.callDone();
    });

    // Hook into the compiler before a new compilation is created.
    hook(compiler, 'compile', () => {
      Object.assign(this.state, {
        ...DEFAULT_STATE(),
        name: this.options.name,
        color: this.options.color,
        start: process.hrtime(),
      });

      this.callStart();
    });
  }
}

export class WorkerProgressPlugin extends ProgressPlugin {
  progressPlugin: WebpackBarProgressPlugin;

  constructor(options: WorkerProgressPluginOptions) {
    super({
      activeModules: true,
      handler: (percentage, message, ...details) => {
        this.progressPlugin.updateProgress(percentage, message, details);
      },
    });
    this.progressPlugin = new WebpackBarProgressPlugin(options);
  }

  apply(compiler: Compiler) {
    super.apply(compiler);
    this.progressPlugin.apply(compiler);
  }
}
