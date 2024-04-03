import { resolve } from 'path';
import FastifyStatic from '@fastify/static';
import { Module, provide } from '@tramvai/core';
import { SERVER_MODULE_STATICS_OPTIONS } from '@tramvai/tokens-server';
import { WEB_FASTIFY_APP_BEFORE_INIT_TOKEN } from '@tramvai/tokens-server-private';

const ONE_YEAR = 365 * 24 * 60 * 60;

@Module({
  providers: [
    provide({
      provide: WEB_FASTIFY_APP_BEFORE_INIT_TOKEN,
      useFactory: ({ options }) => {
        const path = options?.path || 'public';

        return (instance) => {
          instance.register(FastifyStatic, {
            decorateReply: false,
            // for backward compatibility, leaving default prefix.
            // without `wildcard: false` property, this middleware has conflicts with express compatibility plugin
            prefix: `/`,
            // prevent errors by use FastifyStatic only for all defined files in the served folder,
            // will not serve the newly added file on the filesystem - https://github.com/fastify/fastify-static#wildcard
            wildcard: false,
            root: resolve(process.cwd(), path),

            setHeaders: (res) => {
              const oneYearForward = new Date(Date.now() + ONE_YEAR * 1000);

              res.setHeader('cache-control', `public, max-age=${ONE_YEAR}`);
              res.setHeader('expires', oneYearForward.toUTCString());
            },
          });
        };
      },
      deps: {
        options: {
          token: SERVER_MODULE_STATICS_OPTIONS,
          optional: true,
        },
      },
      multi: true,
    }),
  ],
})
export class ServerStaticsModule {}
