export const errorMonitoringScript = () => {
  // critical assets (`data-critical`) that failed to load and may be not recovered by a retry
  const failedCriticalAssets = new Set<string>();

  // `message`/`stack`/`cause` are non-enumerable on Error.prototype by spec, so
  // `JSON.stringify(error)` normally drops them - every transport that logs the raw error object
  // needs them enumerable first. Doing it once here means transports get an out-of-the-box
  // serializable error instead of each reimplementing this.
  function enumerateErrorProperties(error: any) {
    if (!(error instanceof Error)) {
      return;
    }

    Object.defineProperties(error, {
      message: {
        configurable: true,
        enumerable: true,
        writable: true,
      },
      stack: {
        configurable: true,
        enumerable: true,
        // stack is getter
      },
      cause: {
        configurable: true,
        enumerable: true,
        writable: true,
      },
    });

    if ('cause' in error && error.cause && typeof error.cause === 'object') {
      Object.defineProperties(error.cause, {
        message: {
          configurable: true,
          enumerable: true,
          writable: true,
        },
        stack: {
          configurable: true,
          enumerable: true,
          // stack is getter
        },
      });
    }
  }

  window.addEventListener('error', (event: ErrorEvent) => {
    enumerateErrorProperties(event.error);

    // `event.message`/`filename`/`lineno`/`colno`/`timeStamp` come from the browser's ErrorEvent
    // itself, not from `event.error` - e.g. `event.message` is browser-prefixed ("Uncaught
    // TypeError: ..."), unlike the bare `event.error.message`. Transports that need to match
    // against the exact browser-reported error (existing ignore-list filters, telemetry fields)
    // need these alongside the `Error` object.
    const eventFields = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timeStamp: event.timeStamp,
    };

    if (event.error?.appCreationError) {
      // handle `createApplication` sync initialization errors
      window.__TRAMVAI_INLINE_REPORTER?.send('app-start-failed', { error: event.error });
    } else if (event.error?.code === 'ASSET_LOAD_FAIL') {
      // handle failed assets after retry (packages/modules/render/src/retry-assets/retry-assets.inline.ts)
      window.__TRAMVAI_INLINE_REPORTER?.send('asset-load-failed', {
        error: event.error,
        ...eventFields,
      });

      if (event.error.retry === 'failed') {
        failedCriticalAssets.add(event.error.originalUrl);
      }
    } else if (event.error) {
      // handle all unhandled errors except failed assets
      window.__TRAMVAI_INLINE_REPORTER?.send('unhandled-error', {
        error: event.error,
        ...eventFields,
      });
    }
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (event.reason) {
      enumerateErrorProperties(event.reason);
      window.__TRAMVAI_INLINE_REPORTER?.send('unhandled-rejection', { error: event.reason });
    }
  });

  window.addEventListener('load', () => {
    // the assets loading result is deferred with `setTimeout`, and not computed synchronously on `load`:
    // `retry-assets.inline.ts` re-throws `ASSET_LOAD_FAIL` inside its own `setTimeout(..., 0)`,
    // and for a synchronous critical asset from the SSR markup that throw can happen *after*
    // `load`. Computing the result here directly would read a still-empty `failedCriticalAssets`
    // and report `critical-assets-loaded` for a page whose critical asset never recovered.
    // Deferring puts this callback behind the retry script's already-queued timeouts.
    setTimeout(() => {
      // reconcile assets recovered by a retry: the retry script replaces the failed tag with a
      // fallback one that keeps the original url in `data-src`/`data-href` and marks its outcome in
      // the `loaded` attribute. A successful retry means the critical asset is healthy again
      // (packages/modules/render/src/retry-assets/retry-assets.inline.ts)
      document.querySelectorAll('script[data-src],link[data-href]').forEach((tag) => {
        if (tag.getAttribute('loaded') === 'true') {
          failedCriticalAssets.delete(
            (tag as HTMLScriptElement).dataset.src || (tag as HTMLLinkElement).dataset.href || ''
          );
        }
      });

      if (failedCriticalAssets.size > 0) {
        window.__TRAMVAI_INLINE_REPORTER?.send?.('critical-assets-load-failed', {
          urls: Array.from(failedCriticalAssets),
        });
      } else {
        // if TramvaiRetryAssetsModule module is not connected, this event will be always emitted
        window.__TRAMVAI_INLINE_REPORTER?.send?.('critical-assets-loaded');
      }
    }, 0);
  });
};
