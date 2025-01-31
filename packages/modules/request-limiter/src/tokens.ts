import { Scope, createToken } from '@tinkoff/dippy';
import type {
  RequestLimiter,
  RequestLimiterOptions,
  RequestsLimiterMetrics,
} from './requestLimiter';

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

export const REQUESTS_LIMITER_METRICS_TOKEN = createToken<RequestsLimiterMetrics>(
  'requestsLimiterMetricsToken',
  { scope: Scope.SINGLETON }
);
