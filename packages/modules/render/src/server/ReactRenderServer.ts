import { Writable } from 'stream';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { AbortedDeferredError, AbortedStreamError } from '@tinkoff/errors';
import type { DI_TOKEN } from '@tramvai/core';
import type {
  CONTEXT_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
  LOGGER_TOKEN,
} from '@tramvai/module-common';
import type {
  EXTEND_RENDER,
  CUSTOM_RENDER,
  REACT_SERVER_RENDER_MODE,
  WebpackStats,
  REACT_STREAMING_RENDER_TIMEOUT,
} from '@tramvai/tokens-render';
import each from '@tinkoff/utils/array/each';
import type { ChunkExtractor } from '@loadable/server';
import type {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { renderReact } from '../react';
import { flushFiles } from './blocks/utils/flushFiles';

type StreamingTimeout = ExtractDependencyType<typeof REACT_STREAMING_RENDER_TIMEOUT>;
type DeferredActions = ExtractDependencyType<typeof DEFERRED_ACTIONS_MAP_TOKEN>;

class HtmlWritable extends Writable {
  responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;
  responseStream: typeof SERVER_RESPONSE_STREAM;
  extractor: ChunkExtractor;
  stats: WebpackStats;
  alreadySentChunks: string[] | null = null;

  constructor({
    responseTaskManager,
    responseStream,
    extractor,
    stats,
  }: {
    responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;
    responseStream: typeof SERVER_RESPONSE_STREAM;
    extractor: ChunkExtractor;
    stats: WebpackStats;
  }) {
    super();
    this.responseTaskManager = responseTaskManager;
    this.responseStream = responseStream;
    this.extractor = extractor;
    this.stats = stats;
  }

  _write(chunk, encoding, callback) {
    if (!this.alreadySentChunks) {
      // at first _write, all rendered lazy chunks will be saved here
      this.alreadySentChunks = this.extractor.getMainAssets().map((entry) => entry.chunk);
    } else {
      // then, lazy chunks from resolved suspended components will be here
      const newChunks = this.extractor.getMainAssets().map((entry) => entry.chunk);

      newChunks.forEach((c) => {
        if (this.alreadySentChunks.includes(c)) {
          return;
        }

        this.alreadySentChunks.push(c);

        // @todo a lot of duplicate code with `bundleResource`?
        const { publicPath } = this.stats;
        const { scripts, styles } = flushFiles([c], this.stats);
        const genHref = (href) => `${publicPath}${href}`;
        const html = [];

        // we need to inject styles and scripts for lazy components before selective hydration
        // https://github.com/reactwg/react-18/discussions/114
        styles.forEach((s) => {
          html.push(
            `<link rel="stylesheet" href="${genHref(
              s
            )}" crossorigin="anonymous" data-critical="true" />`
          );
        });
        // synchronous script, we can't use async here, will lead to hydration mismatch
        scripts.forEach((s) => {
          html.push(
            `<script src="${genHref(
              s
            )}" charset="utf-8" crossorigin="anonymous" data-critical="true"></script>`
          );
        });

        this.responseTaskManager.push(async () => {
          this.responseStream.push(html.join('\n'));
        });
      });
    }

    // delay writing HTML to response stream
    // @todo some priorities, to prevent conflicts with deferred actions scripts?
    this.responseTaskManager.push(async () => {
      this.responseStream.push(chunk);
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

  deferredActions: DeferredActions;

  di: typeof DI_TOKEN;

  log: ReturnType<typeof LOGGER_TOKEN>;

  responseTaskManager: typeof SERVER_RESPONSE_TASK_MANAGER;

  responseStream: typeof SERVER_RESPONSE_STREAM;

  streamingTimeout: StreamingTimeout;

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
    streamingTimeout,
    deferredActions,
  }) {
    this.context = context;
    this.customRender = customRender;
    this.extendRender = extendRender;
    this.di = di;
    this.renderMode = renderMode;
    this.log = logger('module-render');
    this.responseTaskManager = responseTaskManager;
    this.responseStream = responseStream;
    this.streamingTimeout = streamingTimeout;
    this.deferredActions = deferredActions;
  }

  render({
    extractor,
    stats,
  }: {
    extractor: ChunkExtractor;
    stats: WebpackStats;
  }): Promise<string> {
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
        const htmlWritable = new HtmlWritable({
          responseTaskManager,
          responseStream,
          extractor,
          stats,
        });
        const allReadyDeferred = Deferred();
        const start = Date.now();

        // prevent sent reply before all suspended components are resolved
        responseTaskManager.push(() => {
          // eslint-disable-next-line promise/param-names
          return allReadyDeferred.promise;
        });

        htmlWritable.on('finish', () => {
          // here all suspended components are resolved
          allReadyDeferred.resolve();
        });

        log.info({
          event: 'streaming-render:start',
        });

        const timeout = this.streamingTimeout;
        const unfinishedActions = [];
        let isAborted = false;

        const { pipe, abort } = renderToPipeableStream(renderResult, {
          // we need to run hydration only after first chunk is sent to client
          // https://github.com/reactwg/react-18/discussions/114
          bootstrapScriptContent: `typeof window.__TRAMVAI_DEFERRED_HYDRATION === 'function' ? window.__TRAMVAI_DEFERRED_HYDRATION() : window.__TRAMVAI_DEFERRED_HYDRATION = true;`,
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
          },
          onError(error) {
            // error can be inside Suspense boundaries, this is not critical, continue rendering.
            // for criticall errors, this callback will be called with `onShellError`,
            // so this is a best place to error logging
            log.error({
              event: 'streaming-render:error',
              error: isAborted
                ? new AbortedStreamError({
                    reason: `${timeout}ms timeout exceeded`,
                    unfinishedActions,
                  })
                : error,
            });
          },
          onShellError(error) {
            // always critical error, abort rendering
            reject(error);
          },
        });

        // global response stream timeo
        setTimeout(() => {
          isAborted = true;

          // abort unfinished deferred actions
          this.deferredActions.forEach((action, name) => {
            if (action.isRejected() || action.isResolved()) {
              return;
            }

            unfinishedActions.push(name);

            action.reject(new AbortedDeferredError());
          });

          // abort render stream
          abort();

          reject(
            new AbortedStreamError({
              reason: `${timeout}ms timeout exceeded`,
              unfinishedActions,
            })
          );
        }, timeout);
      });
    }

    const { renderToString } = require('react-dom/server');
    return Promise.resolve(renderToString(renderResult));
  }
}
