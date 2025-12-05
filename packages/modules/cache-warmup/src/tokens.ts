import { AsyncTapableHookInstance, createToken, Scope } from '@tramvai/core';
import type { Request } from '@tinkoff/request-core';

export const CACHE_WARMUP_ENABLED_TOKEN = createToken<boolean>('tramvai cache warmup enabled', {
  scope: Scope.SINGLETON,
});

export type CacheWarmupHooks = {
  'cache-warmup:request': AsyncTapableHookInstance<
    {
      request: (parameters: Request) => Promise<unknown>;
      parameters: Request;
    },
    {
      parameters: Request;
      result: 'resolved' | 'rejected' | 'skipped';
    }
  >;
};

export const CACHE_WARMUP_HOOKS_TOKEN = createToken<CacheWarmupHooks>(
  'tramvai cache warmup hooks',
  { scope: Scope.SINGLETON }
);
