import { Module, TAPABLE_HOOK_FACTORY_TOKEN, commandLineListTokens, provide } from '@tramvai/core';
import { PAPI_SERVICE } from '@tramvai/tokens-http-client';
import { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import { warmUpCache } from './warmup';
import { CACHE_WARMUP_ENABLED_TOKEN, CACHE_WARMUP_HOOKS_TOKEN, CacheWarmupHooks } from './tokens';

export * from './tokens';

@Module({
  imports: [],
  providers: [
    provide({
      provide: CACHE_WARMUP_ENABLED_TOKEN,
      useFactory: ({ papiService, logger }) => {
        const log = logger('cache-warmup');

        if (!papiService) {
          log.info('Skip cache warmup when @tramvai/module-http-client is not enabled');
          return false;
        }

        if (process.env.CACHE_WARMUP_DISABLED === 'true') {
          log.info('Skip cache warm up due to CACHE_WARMUP_DISABLED env');
          return false;
        }

        if (process.env.NODE_ENV !== 'production') {
          log.info('Skip cache warm up in dev environment');
          return false;
        }

        // TODO: revisit this condition
        // if (process.env.MOCKER_ENABLED === 'true') {
        //   log.info('Skip cache warm up when mocker is enabled');
        //   return false;
        // }

        return true;
      },
      deps: {
        papiService: { token: PAPI_SERVICE, optional: true },
        logger: LOGGER_TOKEN,
      },
    }),
    provide({
      provide: commandLineListTokens.listen,
      multi: true,
      useFactory({ papiService, logger, environmentManager, hooks, cacheWarmupEnabled }) {
        return function cacheWarmup() {
          if (!cacheWarmupEnabled) {
            return;
          }

          hooks['cache-warmup:request'].tapPromise(
            'CacheWarmupPlugin',
            async (_, { request, parameters }) => {
              try {
                await request(parameters);
                return {
                  parameters,
                  result: 'resolved',
                };
              } catch {
                return {
                  parameters,
                  result: 'rejected',
                };
              }
            }
          );

          warmUpCache({ papiService: papiService!, logger, environmentManager, hooks });
        };
      },
      deps: {
        papiService: { token: PAPI_SERVICE, optional: true },
        logger: LOGGER_TOKEN,
        environmentManager: ENV_MANAGER_TOKEN,
        hooks: CACHE_WARMUP_HOOKS_TOKEN,
        cacheWarmupEnabled: CACHE_WARMUP_ENABLED_TOKEN,
      },
    }),
    provide({
      provide: CACHE_WARMUP_HOOKS_TOKEN,
      useFactory: ({ hooksFactory }) => {
        return {
          'cache-warmup:request': hooksFactory.createAsync('cache-warmup:request'),
        } satisfies CacheWarmupHooks;
      },
      deps: {
        hooksFactory: TAPABLE_HOOK_FACTORY_TOKEN,
      },
    }),
  ],
})
export class CacheWarmupModule {}
