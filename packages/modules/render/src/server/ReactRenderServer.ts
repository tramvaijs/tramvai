import { Writable } from 'stream';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { DI_TOKEN } from '@tramvai/core';
import type { CONTEXT_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import type {
  EXTEND_RENDER,
  CUSTOM_RENDER,
  REACT_SERVER_RENDER_MODE,
} from '@tramvai/tokens-render';
import each from '@tinkoff/utils/array/each';
import type { ChunkExtractor } from '@loadable/server';
import type {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { renderReact } from '../react';

const RENDER_TIMEOUT = 500;

class HtmlWritable extends Writable {
  responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;

  responseStream: typeof SERVER_RESPONSE_STREAM;

  constructor({
    responseTaskManager,
    responseStream,
  }: {
    responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;
    responseStream: typeof SERVER_RESPONSE_STREAM;
  }) {
    super();
    this.responseTaskManager = responseTaskManager;
    this.responseStream = responseStream;
  }

  _write(chunk, encoding, callback) {
    const html = chunk.toString('utf-8');

    // delay writing HTML to response stream
    // @todo some priorities, to prevent conflicts with deferred actions scripts?
    this.responseTaskManager.push(async () => {
      this.responseStream.push(html);
    });

    callback();
  }
}

const Deferred = () => {
  let resolve;
  let reject;

  // eslint-disable-next-line promise/param-names
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

export class ReactRenderServer {
  customRender: typeof CUSTOM_RENDER;

  extendRender: ExtractDependencyType<typeof EXTEND_RENDER>;

  context: typeof CONTEXT_TOKEN;

  di: typeof DI_TOKEN;

  log: ReturnType<typeof LOGGER_TOKEN>;

  responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;

  responseStream: typeof SERVER_RESPONSE_STREAM;

  renderMode: typeof REACT_SERVER_RENDER_MODE;

  // eslint-disable-next-line sort-class-members/sort-class-members
  constructor({
    context,
    customRender,
    extendRender,
    di,
    renderMode,
    logger,
    responseTaskManager,
    responseStream,
  }) {
    this.context = context;
    this.customRender = customRender;
    this.extendRender = extendRender;
    this.di = di;
    this.renderMode = renderMode;
    this.log = logger('module-render');
    this.responseTaskManager = responseTaskManager;
    this.responseStream = responseStream;
  }

  render(extractor: ChunkExtractor): Promise<string> {
    let renderResult = renderReact({ di: this.di }, this.context);

    each((render) => {
      renderResult = render(renderResult);
    }, this.extendRender ?? []);

    renderResult = extractor.collectChunks(renderResult);

    if (this.customRender) {
      return this.customRender(renderResult);
    }

    if (process.env.__TRAMVAI_CONCURRENT_FEATURES && this.renderMode === 'streaming') {
      return new Promise((resolve, reject) => {
        const { renderToPipeableStream } = require('react-dom/server');
        const { responseTaskManager, responseStream, log } = this;
        const htmlWritable = new HtmlWritable({ responseTaskManager, responseStream });
        const allReadyDeferred = Deferred();
        const start = Date.now();

        // prevent sent reply before all suspended components are resolved
        responseTaskManager.push(() => {
          // eslint-disable-next-line promise/param-names
          return allReadyDeferred.promise;
        });

        log.info({
          event: 'streaming-render:start',
        });

        const { pipe, abort } = renderToPipeableStream(renderResult, {
          onShellReady() {
            log.info({
              event: 'streaming-render:shell-ready',
              duration: Date.now() - start,
            });

            // here all HTML are ready except suspended components
            pipe(htmlWritable);

            // resolve empty HTML, because we will stream it later
            resolve('');
          },
          onAllReady() {
            log.info({
              event: 'streaming-render:all-ready',
              duration: Date.now() - start,
            });

            // here all suspended components are resolved
            allReadyDeferred.resolve();
          },
          onError(error) {
            // error can be inside Suspense boundaries, this is not critical, continue rendering.
            // for criticall errors, this callback will be called with `onShellError`,
            // so this is a best place to error logging
            log.error({
              event: 'streaming-render:error',
              error,
            });
          },
          onShellError(error) {
            // always critical error, abort rendering
            reject(error);
          },
        });

        setTimeout(() => {
          abort();
          reject(new Error('React renderToPipeableStream timeout exceeded'));
        }, RENDER_TIMEOUT);
      });
    }

    const { renderToString } = require('react-dom/server');
    return Promise.resolve(renderToString(renderResult));
  }
}
