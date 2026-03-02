import { provide } from '@tinkoff/dippy';
import {
  ASYNC_LOCAL_STORAGE_TOKEN,
  CONTEXT_TOKEN,
  REQUEST_MANAGER_TOKEN,
  RESPONSE_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import { ETAG_OPTIONS_TOKEN } from '@tramvai/tokens-server';
import { WEB_FASTIFY_APP_INIT_TOKEN } from '@tramvai/tokens-server-private';
import { fnv1a } from './fnv1a';

export const providers = [
  provide({
    provide: WEB_FASTIFY_APP_INIT_TOKEN,
    useFactory: ({ etagOptions, storage }) => {
      return (app) => {
        if (!etagOptions.enabled) {
          return;
        }

        app.addHook('onSend', function (req, reply, payload, done) {
          const di = storage.getStore()?.tramvaiRequestDi;

          if (di) {
            const requestManager = di.get(REQUEST_MANAGER_TOKEN);
            const responseManager = di.get(RESPONSE_MANAGER_TOKEN);
            const context = di.get(CONTEXT_TOKEN);

            const currentEtag = responseManager.getHeader('etag');

            if (!currentEtag) {
              const prefix = etagOptions.weak ? 'W/"' : '"';

              const etag = `${
                prefix +
                fnv1a(
                  etagOptions.weak
                    ? // TODO: customize weak strategy
                      JSON.stringify(context.dehydrate().dispatcher)
                    : (responseManager.getBody() as string)
                ).toString(36)
              }"`;

              responseManager.setHeader('etag', etag);
              reply.header('etag', etag);
            }

            const etag = responseManager.getHeader('etag');
            const ifNoneMatch = requestManager.getHeader('if-none-match');

            if (
              ifNoneMatch === etag ||
              ifNoneMatch === `W/${etag}` ||
              `W/${ifNoneMatch}` === etag
            ) {
              reply.code(304);
              done(null, '');
            } else {
              done(null, payload);
            }
          } else {
            done(null, payload);
          }
        });
      };
    },
    deps: {
      etagOptions: ETAG_OPTIONS_TOKEN,
      storage: ASYNC_LOCAL_STORAGE_TOKEN,
    },
  }),
  provide({
    provide: ETAG_OPTIONS_TOKEN,
    useValue: {
      enabled: false,
    },
  }),
];
