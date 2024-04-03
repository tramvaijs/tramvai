import type { Server } from 'http';
import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest as OriginalFastifyRequest,
} from 'fastify';
import { Scope, createToken } from '@tinkoff/dippy';
import type { Papi } from '@tramvai/papi';
import type { Duplex } from 'stream';

type FastifyRequest = OriginalFastifyRequest & {
  cookies: Record<string, string>;
};

/**
 * @description
 * Direct reference to request object
 */
export const FASTIFY_REQUEST = createToken<FastifyRequest>('fastify request');

/**
 * @description
 * Direct reference to response object
 */
export const FASTIFY_RESPONSE = createToken<FastifyReply>('fastify response');

/**
 * @description
 * Read/Write stream, will be passed to FASTIFY_RESPONSE, method .send()
 * https://lirantal.com/blog/avoid-fastify-reply-raw-and-reply-hijack-despite-being-a-powerful-http-streams-tool/
 */
export const SERVER_RESPONSE_STREAM = createToken<Duplex>('tramvai server response stream');

export type ServerResponseTask = () => Promise<any>;

export interface ServerResponseTaskManager {
  push(task: ServerResponseTask): void;
  processQueue(): void;
  closeQueue(): Promise<any>;
}

/**
 * @description
 * Response stream to client will not be closed before all tasks in queue will be processed
 */
export const SERVER_RESPONSE_TASK_MANAGER = createToken<ServerResponseTaskManager>(
  'tramvai server response task manager'
);

/**
 * @description
 * Creates new server instance
 */
export const SERVER_FACTORY_TOKEN = createToken<() => Server>('server serverFactory');

/**
 * @description
 * Creates web-app instance
 */
export const WEB_FASTIFY_APP_FACTORY_TOKEN =
  createToken<(options: { server: Server }) => FastifyInstance>('webApp fastifyFactory');

/**
 * @description
 * Instance of the current fastify app that handles requests.
 * Can be used to setup custom request handler and add custom routes
 */
export const WEB_FASTIFY_APP_TOKEN = createToken<FastifyInstance>('webApp fastify');

/**
 * @description
 * Subscription to before web-app initialization. It is called before any standard handlers.
 */
export const WEB_FASTIFY_APP_BEFORE_INIT_TOKEN = createToken<FASTIFY_APP_INIT_HANDLER>(
  'webApp fastify beforeInit',
  { multi: true, scope: Scope.SINGLETON }
);

/**
 * @description
 * Subscription to web-app initialization.
 * It is called after global request handlers but before handlers for page rendering
 */
export const WEB_FASTIFY_APP_INIT_TOKEN = createToken<FASTIFY_APP_INIT_HANDLER>(
  'webApp fastify init',
  { multi: true, scope: Scope.SINGLETON }
);

/**
 * @description
 * You can measure application requests duration.
 */
export const WEB_FASTIFY_APP_METRICS_TOKEN = createToken<FASTIFY_APP_INIT_HANDLER>(
  'webApp fastify metrics',
  { multi: true, scope: Scope.SINGLETON }
);

/**
 * @description
 * You can limit requests of application.
 */
export const WEB_FASTIFY_APP_LIMITER_TOKEN = createToken<FASTIFY_APP_INIT_HANDLER>(
  'webApp fastify limiter',
  { multi: true }
);

/**
 * @description
 * Subscription to after web-app initialization.
 * It is called after any other handlers
 */
export const WEB_FASTIFY_APP_AFTER_INIT_TOKEN = createToken<FASTIFY_APP_INIT_HANDLER>(
  'webApp fastify afterInit',
  { multi: true }
);

/**
 * @description
 * Subscription to error handler before any default handlers.
 */
export const WEB_FASTIFY_APP_BEFORE_ERROR_TOKEN = createToken<FASTIFY_APP_ERROR_HANDLER>(
  'webApp fastify beforeError',
  { multi: true }
);

/**
 * @description
 * Subscription to error handler after default handlers.
 */
export const WEB_FASTIFY_APP_AFTER_ERROR_TOKEN = createToken<FASTIFY_APP_ERROR_HANDLER>(
  'webApp fastify afterError',
  { multi: true }
);

/**
 * @description
 * Http server for utility routes
 */
export const UTILITY_SERVER_TOKEN = createToken<Server>('server utilityServer');

/**
 * @description
 * Web app for utility routes
 */
export const UTILITY_WEB_FASTIFY_APP_TOKEN = createToken<FastifyInstance>('webApp utilityServer');

export type FASTIFY_APP_INIT_HANDLER = (app: FastifyInstance) => Promise<void> | void;

export type FASTIFY_APP_ERROR_HANDLER = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<string | undefined | void> | string | undefined | void;

export type PapiExecutor = <Result>(papi: Papi<Result>) => Result;

export const PAPI_EXECUTOR = createToken<PapiExecutor>('papi executor');

/**
 * @description
 * Service that creates a response for the 103 Early Hints status code
 * and writes it to the TCP socket directly
 */
export const EARLY_HINTS_MANAGER_TOKEN = createToken<EarlyHintsManager>('earlyHintsManager');

export interface EarlyHintsManager {
  flushHints(): Promise<void>;
}

/**
 * @description
 * Subscription to papi initialization.
 * It is called before papi routes registration
 */
export const PAPI_FASTIFY_INIT_TOKEN = createToken<FASTIFY_APP_INIT_HANDLER>('papi fastify init', {
  multi: true,
});
