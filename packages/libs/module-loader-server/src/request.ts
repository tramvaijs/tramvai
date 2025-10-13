import type { ContextState } from '@tinkoff/request-core';
import request from '@tinkoff/request-core';
import deduplicate from '@tinkoff/request-plugin-cache-deduplicate';
import http from '@tinkoff/request-plugin-protocol-http';
import circuitBreaker from '@tinkoff/request-plugin-circuit-breaker';
import type { RequestOptions } from './types.h';

export const makeRequest = (
  { circuitBreakerEnabled }: RequestOptions = { circuitBreakerEnabled: true }
) => {
  const plugins = [];

  plugins.push(deduplicate());

  if (circuitBreakerEnabled) {
    plugins.push(
      circuitBreaker({
        failureThreshold: 75,
        minimumFailureCount: 3,
        isSystemError: () => true,
        getKey: (state: ContextState) => {
          return state.request.path ?? state.request.url;
        },
      })
    );
  }

  plugins.push(http());

  return request(plugins);
};
