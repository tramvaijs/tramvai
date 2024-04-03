import { isHttpError, isNotFoundError } from '@tinkoff/errors';
import type { FastifyError } from 'fastify';

// eslint-disable-next-line max-statements
export const prepareLogsForError = ({
  error,
  isRootErrorBoundaryExist,
}: {
  error: FastifyError;
  isRootErrorBoundaryExist: boolean;
}) => {
  let httpStatus: number;
  let logLevel: string;
  let logEvent: string;
  let logMessage: string;

  if (isNotFoundError(error)) {
    httpStatus = error.httpStatus || 404;

    logLevel = 'info';
    logEvent = 'not-found-error';
    logMessage = `NotFoundError, action execution will be aborted.
Not Found page is common use-case with this error - https://tramvai.dev/docs/features/routing/wildcard-routes/#not-found-page`;
  } else if (isHttpError(error)) {
    httpStatus = error.httpStatus || 500;

    if (error.httpStatus >= 500) {
      logLevel = 'error';
      logEvent = 'send-server-error';
      logMessage = `This is expected server error, here is most common cases:
- Router Guard blocked request - https://tramvai.dev/docs/features/routing/hooks-and-guards#guards
- Forced Page Error Boundary render with 5xx code in Guard or Action - https://tramvai.dev/docs/features/error-boundaries#force-render-page-error-boundary-in-action`;
    } else {
      logLevel = 'info';
      logEvent = 'http-error';
      logMessage = `This is expected server error, here is most common cases:
  - Route is not found - https://tramvai.dev/docs/features/routing/flow#server-navigation
  - Forced Page Error Boundary render with 4xx code in Guard or Action - https://tramvai.dev/docs/features/error-boundaries#force-render-page-error-boundary-in-action
  - Request Limiter blocked request with 429 code - https://tramvai.dev/docs/references/modules/request-limiter/`;
    }
  } else {
    httpStatus = error.statusCode || 500;

    if (error.statusCode >= 500) {
      logLevel = 'error';
      logEvent = 'send-server-error';
      logMessage = `This is Fastify 5xx error, you can check ${
        error.code
      } code in https://www.fastify.io/docs/latest/Reference/Errors/#${error.code.toLowerCase()} page`;
    } else if (error.statusCode >= 400) {
      // a lot of noise with FST_ERR_CTP_INVALID_MEDIA_TYPE 4xx logs from Fastify,
      // when somebody tries to scan our site and send some unsupported content types
      logLevel = 'info';
      logEvent = 'fastify-error-4xx';
      logMessage = `This is Fastify 4xx error, you can check ${
        error.code
      } code in https://www.fastify.io/docs/latest/Reference/Errors/#${error.code.toLowerCase()} page`;
    } else {
      logLevel = 'error';
      logEvent = 'send-server-error';
      logMessage = `Unexpected server error. Error cause will be in "error" parameter.
  Most likely an error has occurred in the rendering of the current React page component
  You can try to find relative logs by using "x-request-id" header`;
    }
  }

  logMessage = `${logMessage}
${
  isRootErrorBoundaryExist
    ? 'Root Error Boundary will be rendered for the client'
    : 'You can add Error Boundary for better UX - https://tramvai.dev/docs/features/error-boundaries'
}'`;

  return { logMessage, logLevel, logEvent, httpStatus };
};
