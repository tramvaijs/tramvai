import type { PropsWithChildren, ReactElement } from 'react';
import { isConditionFailError } from '@tinkoff/errors';
import type { Provider } from '@tramvai/core';
import { APP_INFO_TOKEN } from '@tramvai/core';
import { provide } from '@tramvai/core';
import * as ReactQuery from '@tanstack/react-query';
import type { DehydratedState } from '@tanstack/react-query';
import { CHILD_APP_INTERNAL_CONFIG_TOKEN } from '@tramvai/tokens-child-app';
import { EXTEND_RENDER } from '@tramvai/tokens-render';
import {
  QUERY_CLIENT_TOKEN,
  QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
  QUERY_CLIENT_DEFAULT_OPTIONS_TOKEN,
  QUERY_DEHYDRATE_STATE_NAME_TOKEN,
} from '@tramvai/tokens-react-query';

const HydrateNameV4 = 'Hydrate';
// @ts-expect-error Can't use require because of dual-package hazard
// (CJS version of context will be imported here, and ESM version in user space)
// I think treeshaking will be broken here, but looks like we already use all exports from `@tanstack/react-query`
const Hydrate: React.ComponentType<PropsWithChildren<{ state: DehydratedState }>> =
  HydrateNameV4 in ReactQuery ? ReactQuery[HydrateNameV4] : ReactQuery.HydrationBoundary;

export const sharedQueryProviders: Provider[] = [
  provide({
    provide: QUERY_CLIENT_TOKEN,
    useFactory: ({ defaultOptions }) => {
      const { queries = {} } = defaultOptions;

      return new ReactQuery.QueryClient({
        defaultOptions: {
          ...defaultOptions,
          queries: {
            ...queries,
            retry:
              typeof queries.retry === 'function'
                ? queries.retry
                : (count, error) => {
                    // we should ignore ConditionFailError as it has special meaning
                    // and anyway action resolved with ConditionFailError won't be resolved successfully after retry
                    if (error && isConditionFailError(error as Error)) {
                      return false;
                    }

                    return count < ((queries.retry as number) ?? 3);
                  },
          },
        },
      });
    },
    deps: {
      defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS_TOKEN,
    },
  }),
  provide({
    provide: QUERY_CLIENT_DEFAULT_OPTIONS_TOKEN,
    useValue: {
      queries: {
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    },
  }),
  provide({
    provide: EXTEND_RENDER,
    multi: true,
    useFactory: ({ queryClient, state }) => {
      return (render: ReactElement) => {
        return (
          <ReactQuery.QueryClientProvider client={queryClient}>
            <Hydrate state={state}>{render}</Hydrate>
          </ReactQuery.QueryClientProvider>
        );
      };
    },
    deps: {
      queryClient: QUERY_CLIENT_TOKEN,
      state: QUERY_CLIENT_DEHYDRATED_STATE_TOKEN,
    },
  }),
  provide({
    provide: QUERY_DEHYDRATE_STATE_NAME_TOKEN,
    useFactory: ({ childAppConfig, appInfo }) => {
      return `__REACT_QUERY_STATE__${childAppConfig?.key ?? appInfo?.appName}`;
    },
    deps: {
      childAppConfig: { token: CHILD_APP_INTERNAL_CONFIG_TOKEN, optional: true },
      appInfo: { token: APP_INFO_TOKEN, optional: true },
    },
  }),
];
