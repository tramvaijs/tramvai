import { provide } from '@tramvai/core';
import fromPairs from '@tinkoff/utils/object/fromPairs';
import merge from '@tinkoff/utils/object/merge';
import { ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/tokens-common';
import { GET_RETRY_URL, RETRY_HOSTNAME_MAP } from '@tramvai/tokens-render';
import { getRetryUrl } from './get-retry-url.inline';

export const providers = [
  provide({
    provide: ENV_USED_TOKEN,
    multi: true,
    useValue: [
      {
        key: 'RETRY_HOSTNAME_MAP',
        optional: true,
      },
    ],
  }),
  provide({
    provide: RETRY_HOSTNAME_MAP,
    useFactory: ({ envManager }) => {
      const defaultMap = {};

      const valueFromEnv = envManager.get('RETRY_HOSTNAME_MAP');

      const removeTrailingSlash = (input: string) =>
        input.endsWith('/') ? input.slice(0, -1) : input;

      if (valueFromEnv !== undefined) {
        return merge(
          defaultMap,
          fromPairs(
            valueFromEnv
              .split(',')
              .map((s) => s.split('='))
              .map((entries) => entries.map(removeTrailingSlash) as [string, string])
          )
        );
      }

      return defaultMap;
    },
    deps: {
      envManager: ENV_MANAGER_TOKEN,
    },
  }),
  provide({
    provide: GET_RETRY_URL,
    useFactory:
      ({ retryMap }) =>
      (url: string) =>
        getRetryUrl(url, retryMap),
    deps: {
      retryMap: RETRY_HOSTNAME_MAP,
    },
  }),
];
