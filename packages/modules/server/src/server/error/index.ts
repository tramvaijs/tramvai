import isNil from '@tinkoff/utils/is/nil';
import type { FastifyError, FastifyInstance } from 'fastify';
import { isRedirectFoundError } from '@tinkoff/errors';
import type { LOGGER_TOKEN } from '@tramvai/module-common';
import type { FETCH_WEBPACK_STATS_TOKEN } from '@tramvai/tokens-render';
import type {
  WEB_FASTIFY_APP_AFTER_ERROR_TOKEN,
  WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN,
} from '@tramvai/tokens-server-private';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { STATIC_ROOT_ERROR_BOUNDARY_ERROR_TOKEN } from '@tramvai/tokens-server';
import { getRequestInfo, getRootErrorBoundary, runHandlersFactory } from './utils';
import { serveRootErrorBoundary } from './serveRootErrorBoundary';
import { prepareLogsForError } from './prepareLogsForError';
import { renderErrorBoundaryPageToString } from './renderErrorBoundaryPageToString';

export const errorHandler = async (
  app: FastifyInstance,
  {
    log,
    beforeError,
    afterError,
    fetchWebpackStats,
    staticRootErrorBoundaryError,
  }: {
    log: ReturnType<typeof LOGGER_TOKEN>;
    beforeError: ExtractDependencyType<typeof WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN>;
    afterError: ExtractDependencyType<typeof WEB_FASTIFY_APP_AFTER_ERROR_TOKEN>;
    fetchWebpackStats: ExtractDependencyType<typeof FETCH_WEBPACK_STATS_TOKEN>;
    staticRootErrorBoundaryError: ExtractDependencyType<
      typeof STATIC_ROOT_ERROR_BOUNDARY_ERROR_TOKEN
    >;
  }
) => {
  const RootErrorBoundary = getRootErrorBoundary();
  const isRootErrorBoundaryExist = RootErrorBoundary !== null;

  if (process.env.TRAMVAI_CLI_COMMAND === 'static' && isRootErrorBoundaryExist) {
    serveRootErrorBoundary({
      render: async () => {
        const webpackStats = await fetchWebpackStats();

        return renderErrorBoundaryPageToString({
          element: RootErrorBoundary,
          requestUrl: '/5xx.html',
          error: staticRootErrorBoundaryError ?? {
            name: 'STATIC_ROOT_ERROR_BOUNDARY_ERROR',
            message: 'Default error for root error boundary',
          },
          httpStatus: 500,
          webpackStats,
        });
      },
      app,
    });
  }

  app.setErrorHandler(async (error: FastifyError, request, reply) => {
    const runHandlers = runHandlersFactory(error, request, reply);
    const requestInfo = getRequestInfo(request);

    const beforeErrorResult = await runHandlers(beforeError);
    if (!isNil(beforeErrorResult)) {
      return beforeErrorResult;
    }

    if (isRedirectFoundError(error)) {
      log.info({
        event: 'redirect-found-error',
        message: `RedirectFoundError, redirect to ${error.nextUrl}, action execution will be aborted.
More information about redirects - https://tramvai.dev/docs/features/routing/redirects`,
        error,
        requestInfo,
      });

      reply
        .header('cache-control', 'no-store, no-cache, must-revalidate')
        .redirect(error.nextUrl, error.httpStatus || 307);
      return;
    }

    const { logMessage, logLevel, logEvent, httpStatus } = prepareLogsForError({
      error,
      isRootErrorBoundaryExist,
    });
    log[logLevel]({
      event: logEvent,
      message: logMessage,
      error,
      requestInfo,
    });

    const afterErrorResult = await runHandlers(afterError);
    if (!isNil(afterErrorResult)) {
      return afterErrorResult;
    }

    reply.status(httpStatus);

    if (isRootErrorBoundaryExist) {
      try {
        const webpackStats = await fetchWebpackStats();

        const response = renderErrorBoundaryPageToString({
          element: RootErrorBoundary,
          requestUrl: requestInfo.url,
          webpackStats,
          error,
          httpStatus,
        });

        log.info({
          event: 'render-root-error-boundary',
          message: 'Render Root Error Boundary for the client',
        });

        reply
          .header('Content-Type', 'text/html; charset=utf-8')
          .header('Content-Length', Buffer.byteLength(response, 'utf8'))
          .header('Cache-Control', 'no-store, no-cache, must-revalidate');

        return response;
      } catch (e) {
        log.warn({
          event: 'failed-root-error-boundary',
          message: 'Root Error Boundary rendering failed',
          error: e,
        });
      }
    }

    throw error;
  });
};
