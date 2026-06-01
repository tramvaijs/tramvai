import type { FastifyError, FastifyInstance } from 'fastify';
import { fastifyCookie } from '@fastify/cookie';
import fastifyFormBody from '@fastify/formbody';

import {
  FormActionParameters,
  getPapiParameters,
  Papi,
  PapiResponse,
  PapiResultCode,
} from '@tramvai/papi';
import { DI_TOKEN, ExtractDependencyType } from '@tramvai/core';
import { LOGGER_TOKEN, RESPONSE_MANAGER_TOKEN } from '@tramvai/tokens-common';
import type {
  PAPI_FASTIFY_INIT_TOKEN,
  WEB_FASTIFY_APP_TOKEN,
} from '@tramvai/tokens-server-private';
import { FASTIFY_REQUEST, FASTIFY_RESPONSE, PAPI_EXECUTOR } from '@tramvai/tokens-server-private';
import { createChildContainer, Scope } from '@tinkoff/dippy';
import { HttpError, RedirectFoundError } from '@tinkoff/errors';

export interface CreateOptions {
  baseUrl: string;
  di: typeof DI_TOKEN;
  logger: typeof LOGGER_TOKEN;
  papiInitHandlers: ExtractDependencyType<typeof PAPI_FASTIFY_INIT_TOKEN>;
  isFormActions?: boolean;
}

const runHandlers = (
  instance: ExtractDependencyType<typeof WEB_FASTIFY_APP_TOKEN>,
  handlers: ExtractDependencyType<typeof PAPI_FASTIFY_INIT_TOKEN>
) => {
  return Promise.all([handlers && Promise.all(handlers.map((handler) => handler(instance)))]);
};

const getErrorHttpStatus = (error: FastifyError): number => {
  return (error as unknown as HttpError).httpStatus ?? (error.validation ? 400 : 503);
};

export function createApi(
  rootApp: FastifyInstance,
  papiList: Papi[],
  { baseUrl, di, logger, papiInitHandlers, isFormActions = false }: CreateOptions
) {
  const paths = new Set();
  const papiLog = logger('papi');

  rootApp.register(
    async (app) => {
      await app.register(fastifyCookie);
      await app.register(fastifyFormBody, { bodyLimit: 2097152 }); // 2mb

      await runHandlers(app, papiInitHandlers);

      for (const papi of papiList) {
        const papiParams = getPapiParameters(papi);

        if (!papiParams) {
          throw new Error(`papi should be created using createPapiMethod from @tramvai/papi,
        got: ${JSON.stringify(papi)}`);
        }

        const { path, options } = papiParams;
        const { timeout, schema } = options;

        if (!path) {
          throw new Error(`No path in papi handler, got: ${JSON.stringify(papi)}`);
        }

        const method = isFormActions ? 'post' : papiParams.method;

        const key = `${method} ${path}`;

        if (paths.has(key)) {
          throw new Error(`papi: route '${key}' already registered`);
        }

        paths.add(key);

        const childLog = papiLog.child(`${method}_${path}`);

        app[method](
          path,
          {
            schema,
            ...(isFormActions
              ? { constraints: { accept: 'application/json' }, attachValidation: true }
              : {}),
            errorHandler: async (error, req, res): Promise<PapiResponse> => {
              if (isFormActions) {
                const formActionParams = papiParams as FormActionParameters;

                // Handle form action redirects that are invoked via throwRedirectFoundError() function
                if (error.name === RedirectFoundError.errorName) {
                  const redirect = error as unknown as RedirectFoundError;

                  res.status(redirect.httpStatus ?? 303);

                  return {
                    resultCode: PapiResultCode.REDIRECT,
                    nextUrl: redirect.nextUrl,
                  };
                }

                const httpStatus = getErrorHttpStatus(error);
                res.status(httpStatus);

                childLog.error(error);

                return {
                  resultCode: PapiResultCode.ERROR,
                  error: { ...error },
                };
              }

              const httpStatus = getErrorHttpStatus(error);
              res.status(httpStatus);

              childLog.error(error);

              return {
                resultCode: PapiResultCode.INTERNAL_ERROR,
                errorMessage: error.message ?? 'internal error',
              };
            },
          },
          async (req, res): Promise<PapiResponse> => {
            const childDi = createChildContainer(di, [
              {
                provide: FASTIFY_REQUEST,
                scope: Scope.REQUEST,
                useValue: req,
              },
              {
                provide: FASTIFY_RESPONSE,
                scope: Scope.REQUEST,
                useValue: res,
              },
            ]);

            const papiExecutor = childDi.get(PAPI_EXECUTOR);

            // TODO: use abortSignal
            const payload = await Promise.race([
              papiExecutor(papi),
              new Promise((resolve, reject) =>
                setTimeout(
                  () =>
                    reject(
                      new HttpError({
                        httpStatus: 503,
                        message: 'Execution timeout',
                      })
                    ),
                  timeout
                )
              ),
            ]);

            const responseManager = childDi.get(RESPONSE_MANAGER_TOKEN);

            res.headers(responseManager.getHeaders()).status(responseManager.getStatus());

            if (res.sent) {
              return;
            }

            if (isFormActions) {
              return {
                resultCode: PapiResultCode.OK,
                payload,
              };
            }

            if (!payload && responseManager.getBody()) {
              res.send(responseManager.getBody());
              return res;
            }

            return {
              resultCode: PapiResultCode.OK,
              payload,
            };
          }
        );
      }
    },
    { prefix: baseUrl }
  );
}
