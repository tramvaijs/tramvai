import { createToken, Scope } from '@tinkoff/dippy';
import type { Sentry, SentryOptions, SentryRequestOptions, Event, EventHint } from './types.h';

export const SENTRY_TOKEN = createToken<Sentry>('sentry', { scope: Scope.SINGLETON });
export const SENTRY_DSN_TOKEN = createToken<string>('sentryDSNToken', { scope: Scope.SINGLETON });
export const SENTRY_OPTIONS_TOKEN = createToken<SentryOptions[]>('sentryOptions', {
  scope: Scope.SINGLETON,
  multi: true,
});
export const SENTRY_REQUEST_OPTIONS_TOKEN = createToken<SentryRequestOptions[]>(
  'sentryRequestOptions',
  {
    scope: Scope.SINGLETON,
    multi: true,
  }
);
export const SENTRY_LAZY_LOADING = createToken<boolean>('sentryLazyLoading', {
  scope: Scope.SINGLETON,
});

export type ErrorsFilter = (event: Event, hint?: EventHint) => boolean;

export const SENTRY_FILTER_ERRORS = createToken<ErrorsFilter>('SENTRY_FILTER_ERRORS', {
  scope: Scope.SINGLETON,
  multi: true,
});

export const SENTRY_SERVER_ENABLE_DEFAULT_HANDLERS = createToken<boolean>(
  'SENTRY_SERVER_ENABLE_DEFAULT_HANDLERS',
  { scope: Scope.SINGLETON }
);
