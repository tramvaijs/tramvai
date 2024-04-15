import { Scope, createToken } from '@tinkoff/dippy';
import type { RequestLimiter, RequestLimiterOptions } from './requestLimiter';

export const REQUESTS_LIMITER_TOKEN = createToken<RequestLimiter>('requestsLimiterToken', {
  scope: Scope.SINGLETON,
});

export const REQUESTS_LIMITER_ACTIVATE_TOKEN = createToken<boolean>(
  'requestsLimiterActivateToken',
  { scope: Scope.SINGLETON }
);

export const REQUESTS_LIMITER_OPTIONS_TOKEN = createToken<RequestLimiterOptions>(
  'requestsLimiterOptionsToken',
  { scope: Scope.SINGLETON }
);
