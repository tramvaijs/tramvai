import fastify from 'fastify';
import { fastifyCookie } from '@fastify/cookie';
import fastifyFormBody from '@fastify/formbody';
import type { EXECUTION_CONTEXT_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/tokens-common';
import { ROOT_EXECUTION_CONTEXT_TOKEN, RESPONSE_MANAGER_TOKEN } from '@tramvai/tokens-common';
import type { COMMAND_LINE_RUNNER_TOKEN } from '@tramvai/core';
import { Scope } from '@tramvai/core';
import type { SERVER_TOKEN } from '@tramvai/tokens-server';
import {
  FASTIFY_REQUEST,
  FASTIFY_RESPONSE,
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import type {
  WEB_FASTIFY_APP_TOKEN,
  WEB_FASTIFY_APP_AFTER_INIT_TOKEN,
  WEB_FASTIFY_APP_BEFORE_INIT_TOKEN,
  WEB_FASTIFY_APP_INIT_TOKEN,
  WEB_FASTIFY_APP_LIMITER_TOKEN,
  WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN,
  WEB_FASTIFY_APP_AFTER_ERROR_TOKEN,
  WEB_FASTIFY_APP_METRICS_TOKEN,
} from '@tramvai/tokens-server-private';
import { REACT_SERVER_RENDER_MODE, type FETCH_WEBPACK_STATS_TOKEN } from '@tramvai/tokens-render';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { optional, provide } from '@tinkoff/dippy';
import { errorHandler } from './error';

export const webAppFactory = ({ server }: { server: typeof SERVER_TOKEN }) => {
  const app = fastify({
    ignoreTrailingSlash: true,
    bodyLimit: 2097152, // 2mb
    serverFactory: (handler) => {
      server.on('request', handler);

      return server;
    },
  });

  return app;
};

export const webAppInitCommand = ({
  app,
  logger,
  commandLineRunner,
  executionContextManager,
  beforeInit,
  requestMetrics,
  limiterRequest,
  init,
  afterInit,
  beforeError,
  afterError,
  fetchWebpackStats,
}: {
  app: ExtractDependencyType<typeof WEB_FASTIFY_APP_TOKEN>;
  logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
  commandLineRunner: ExtractDependencyType<typeof COMMAND_LINE_RUNNER_TOKEN>;
  executionContextManager: ExtractDependencyType<typeof EXECUTION_CONTEXT_MANAGER_TOKEN>;
  beforeInit: ExtractDependencyType<typeof WEB_FASTIFY_APP_BEFORE_INIT_TOKEN>;
  requestMetrics: ExtractDependencyType<typeof WEB_FASTIFY_APP_METRICS_TOKEN>;
  limiterRequest: ExtractDependencyType<typeof WEB_FASTIFY_APP_LIMITER_TOKEN>;
  init: ExtractDependencyType<typeof WEB_FASTIFY_APP_INIT_TOKEN>;
  afterInit: ExtractDependencyType<typeof WEB_FASTIFY_APP_AFTER_INIT_TOKEN>;
  beforeError: ExtractDependencyType<typeof WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN>;
  afterError: ExtractDependencyType<typeof WEB_FASTIFY_APP_AFTER_ERROR_TOKEN>;
  fetchWebpackStats: ExtractDependencyType<typeof FETCH_WEBPACK_STATS_TOKEN>;
}) => {
  const log = logger('server:webapp');

  const runHandlers = (
    instance: ExtractDependencyType<typeof WEB_FASTIFY_APP_TOKEN>,
    handlers: ExtractDependencyType<typeof WEB_FASTIFY_APP_INIT_TOKEN>
  ) => {
    return Promise.all([handlers && Promise.all(handlers.map((handler) => handler(instance)))]);
  };

  return async function webAppInit() {
    errorHandler(app, { log, beforeError, afterError, fetchWebpackStats });

    await app.register(async (instance) => {
      await runHandlers(instance, beforeInit);
    });

    await app.register(async (instance) => {
      await runHandlers(instance, requestMetrics);
      await runHandlers(instance, limiterRequest);

      await app.register(fastifyCookie);
      await app.register(fastifyFormBody);

      await runHandlers(instance, init);

      // break the cycle of event loop to allow server to handle other requests
      // while current on is in processing
      // mainly to prevent problems and response hanging in case the response process
      // uses only sync and microtask code
      instance.addHook('preHandler', (req, res, next) => {
        setImmediate(next);
      });

      instance.all('*', async (request, reply) => {
        try {
          log.debug({
            event: 'start:request',
            message: 'Клиент зашел на страницу',
            url: request.url,
          });

          await executionContextManager.withContext(null, 'root', async (rootExecutionContext) => {
            const di = await commandLineRunner.run('server', 'customer', [
              provide({
                provide: ROOT_EXECUTION_CONTEXT_TOKEN,
                useValue: rootExecutionContext,
              }),
              {
                provide: FASTIFY_REQUEST,
                scope: Scope.REQUEST,
                useValue: request,
              },
              {
                provide: FASTIFY_RESPONSE,
                scope: Scope.REQUEST,
                useValue: reply,
              },
            ]);
            const serverResponseStream = di.get(SERVER_RESPONSE_STREAM);
            const serverResponseTaskManager = di.get(SERVER_RESPONSE_TASK_MANAGER);
            const responseManager = di.get(RESPONSE_MANAGER_TOKEN);
            // @todo incorrect type inference for optional provider
            const renderMode = di.get(
              optional(REACT_SERVER_RENDER_MODE)
            ) as typeof REACT_SERVER_RENDER_MODE;

            if (reply.sent) {
              log.debug({
                event: 'response-ended',
                message: 'Response was already ended.',
                url: request.url,
              });
            } else {
              reply
                .header('content-type', 'text/html')
                .headers(responseManager.getHeaders())
                .status(responseManager.getStatus());

              if (renderMode === 'streaming') {
                const appHtmlsAttrs = di.get('tramvai app html attributes');
                // split HTML for sequential React HTML chunks streaming inside .application tag
                const [headAndBodyStart, bodyEnd] = (responseManager.getBody() as string).split(
                  `<div ${appHtmlsAttrs}></div>`
                );

                // https://fastify.dev/docs/latest/Reference/Reply/#streams
                reply.send(serverResponseStream);

                // send head and start of body tags immediately
                serverResponseStream.push(`${headAndBodyStart}<div ${appHtmlsAttrs}>`);

                // run all tasks, chunks for renderToPipeableStream will be sent here
                // in future, it can be done earlier, e.g. as Early Hints module
                serverResponseTaskManager.processQueue();

                // wait all tasks
                await serverResponseTaskManager.closeQueue();

                // writing the end of body
                serverResponseStream.push(`</div>${bodyEnd}`);

                // end response
                serverResponseStream.push(null);
              } else {
                reply.send(responseManager.getBody());
              }
            }
          });
        } catch (err) {
          if (err.di) {
            const responseManager: typeof RESPONSE_MANAGER_TOKEN =
              err.di.get(RESPONSE_MANAGER_TOKEN);

            if (responseManager && !reply.sent) {
              reply.headers(responseManager.getHeaders());
            }
          }

          throw err;
        }
      });
    });

    await app.register(async (instance) => {
      await runHandlers(instance, afterInit);
    });

    await app.ready();
  };
};
