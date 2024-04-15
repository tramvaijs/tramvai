// Идея взята из https://github.com/getsentry/sentry-javascript/blob/master/packages/browser/src/loader.js

/* eslint-disable prefer-rest-params */

export function createErrorInterceptor(namespace: string) {
  const originalOnError = window.onerror;
  const originalOnUnhandledRejection = window.onunhandledrejection;

  const errorInterceptorNamespace = {
    errorsQueue: [] as Error[],
    onError(error: Error) {
      this.errorsQueue.push(error);
    },
    clear() {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;

      delete (window as any)[namespace];
    },
  };

  (window as any)[namespace] = errorInterceptorNamespace;

  window.onerror = function (_message, _source, _lineno, _colno, error) {
    if (error) {
      errorInterceptorNamespace.onError(error);
    }

    if (originalOnError) {
      //@ts-expect-error
      originalOnError.apply(window, arguments);
    }
  };

  window.onunhandledrejection = function (e) {
    let reason: Error | null = null;

    if ('reason' in e) {
      reason = e.reason;
      //@ts-expect-error
    } else if ('detail' in e && 'reason' in e.detail) {
      //@ts-expect-error
      reason = e.detail.reason;
    }

    if (reason) {
      errorInterceptorNamespace.onError(reason);
    }

    if (originalOnUnhandledRejection) {
      //@ts-expect-error
      originalOnUnhandledRejection.apply(window, arguments);
    }
  };
}

/* eslint-enable prefer-rest-params */
