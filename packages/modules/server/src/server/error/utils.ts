import type { ErrorBoundaryComponent } from '@tramvai/react';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN } from '@tramvai/tokens-server-private';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const getRootErrorBoundary = (): ErrorBoundaryComponent | null => {
  try {
    // In case of direct `require` by path, e.g.
    // `require(path.resolve(process.cwd(), 'src', 'error.tsx'))` file
    // doesn't include in the bundle, that is why we are using a
    // path alias here along with webpack config option.
    // See usage of `ROOT_ERROR_BOUNDARY_ALIAS`.
    // eslint-disable-next-line import/no-unresolved, import/extensions
    const RootErrorBoundary = require('@/__private__/error').default;
    return RootErrorBoundary;
  } catch {
    return null;
  }
};

export const runHandlersFactory =
  (error: FastifyError, request: FastifyRequest, reply: FastifyReply) =>
  async (handlers: ExtractDependencyType<typeof WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN>) => {
    if (handlers) {
      for (const handler of handlers) {
        const result = await handler(error, request, reply);

        if (result) {
          return result;
        }
      }
    }
  };

export const getRequestInfo = (request: FastifyRequest) => ({
  ip: request.ip,
  requestId: request.headers['x-request-id'],
  url: request.url,
});
