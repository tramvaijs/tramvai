import { createApp, provide } from '@tramvai/core';
import type { ActionCondition } from '@tramvai/module-common';
import {
  ACTION_CONDITIONALS,
  COMBINE_REDUCERS,
  CommonModule,
  CONTEXT_TOKEN,
  ENV_MANAGER_TOKEN,
  ENV_USED_TOKEN,
} from '@tramvai/module-common';
import type { REACT_SERVER_RENDER_MODE } from '@tramvai/module-render';
import { RenderModule } from '@tramvai/module-render';
import { ROUTES_TOKEN, SpaRouterModule } from '@tramvai/module-router';
import { ServerModule } from '@tramvai/module-server';
import type { ContractsValidation } from '@tramvai/module-child-app';
import {
  ChildAppModule,
  CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
  HOST_REQUIRED_CONTRACTS,
  Assert,
} from '@tramvai/module-child-app';
import { HTTP_CLIENT_FACTORY, HttpClientModule } from '@tramvai/module-http-client';
import { ReactQueryModule } from '@tramvai/module-react-query';
import { MockerModule } from '@tramvai/module-mocker';
import { ClientHintsModule } from '@tramvai/module-client-hints';
import { routes } from './routes';
import type { MISSED_CHILD_CONTRACT, MISSED_CHILD_CONTRACT_FALLBACK } from '../shared/tokens';
import {
  FAKE_API_CLIENT,
  MISSED_HOST_CONTRACT,
  MISSED_HOST_CONTRACT_FALLBACK,
  TEST_CHILD_CONTRACT,
} from '../shared/tokens';
import { globalStore } from './stores/global';
import { preloadedChildAppInfoStore } from './stores/preload';

if (typeof window === 'undefined') {
  const { setDefaultResultOrder } = require('dns');

  if (typeof setDefaultResultOrder === 'function') {
    setDefaultResultOrder('ipv4first');
  }
}

// support v2.x.x root app version for integration tests matrix
const {
  CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
  HOST_PROVIDED_CONTRACTS,
  HOST_CONTRACTS_FALLBACK,
} = require('@tramvai/module-child-app');

declare module '@tramvai/module-child-app' {
  export interface TypedContractsProvided {
    FAKE_API_CLIENT: typeof FAKE_API_CLIENT;
    ROUTES_TOKEN: typeof ROUTES_TOKEN;
    MISSED_CHILD_CONTRACT: typeof MISSED_CHILD_CONTRACT;
    MISSED_CHILD_CONTRACT_FALLBACK: typeof MISSED_CHILD_CONTRACT_FALLBACK;
  }
}

// support for older root app version for integraton tests matrix
if (typeof Assert === 'function') {
  Assert({} as ContractsValidation);
}

createApp({
  name: 'root-app',
  bundles: {
    'preload-error': () =>
      import(/* webpackChunkName: "preload-error" */ './bundles/preload-error'),
    base: () => import(/* webpackChunkName: "base" */ './bundles/base'),
    'base-not-preloaded': () =>
      import(/* webpackChunkName: "base-not-preloaded" */ './bundles/base-not-preloaded'),
    'client-hints': () => import(/* webpackChunkName: "client-hints" */ './bundles/client-hints'),
    commandline: () => import(/* webpackChunkName: "commandline" */ './bundles/commandline'),
    error: () => import(/* webpackChunkName: "error" */ './bundles/error'),
    'react-query': () => import(/* webpackChunkName: "react-query" */ './bundles/react-query'),
    router: () => import(/* webpackChunkName: "router" */ './bundles/router'),
    state: () => import(/* webpackChunkName: "state" */ './bundles/state'),
    loadable: () => import(/* webpackChunkName: "loadable" */ './bundles/loadable'),
    contracts: () => import(/* webpackChunkName: "contracts" */ './bundles/contracts'),
  },
  modules: [
    CommonModule,
    RenderModule,
    SpaRouterModule.forRoot(routes),
    ServerModule,
    HttpClientModule,
    ChildAppModule,
    ClientHintsModule,
    ReactQueryModule,
    MockerModule,
  ],
  providers: [
    provide({
      provide: ENV_USED_TOKEN,
      multi: true,
      useValue: [
        {
          key: 'FAKE_API',
          value: 'https://fake-api.com/',
        },
        {
          key: 'REACT_SERVER_RENDER_MODE',
          value: 'sync',
        },
        {
          key: 'CHILD_APP_TEST_ISOLATE_DI',
          optional: true,
        },
      ],
    }),
    {
      provide: FAKE_API_CLIENT,
      useFactory: ({ factory, envManager }) => {
        return factory({
          name: 'fake-api',
          baseUrl: envManager.get('FAKE_API'),
        });
      },
      deps: {
        factory: HTTP_CLIENT_FACTORY,
        envManager: ENV_MANAGER_TOKEN,
      },
    },
    provide({
      provide: 'reactServerRenderMode',
      useFactory: ({ envManager }) => {
        return envManager.get('REACT_SERVER_RENDER_MODE') as typeof REACT_SERVER_RENDER_MODE;
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: COMBINE_REDUCERS,
      multi: true,
      useValue: [globalStore, preloadedChildAppInfoStore],
    }),
    provide({
      provide: ACTION_CONDITIONALS,
      multi: true,
      useFactory: ({ context }): ActionCondition => ({
        key: 'factory',
        fn: (checker) => {
          const { factory } = checker.conditions;

          if (factory) {
            const state = context.getState(globalStore);

            if (!state) {
              return checker.forbid();
            }
            checker.allow();
          }
        },
      }),
      deps: {
        context: CONTEXT_TOKEN,
      },
    }),
    ...(CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN && ENV_MANAGER_TOKEN
      ? [
          provide({
            provide: CHILD_APP_ROOT_DI_ACCESS_MODE_TOKEN,
            useFactory: ({ envManager }) => {
              return {
                mode: envManager.get('CHILD_APP_TEST_ISOLATE_DI')
                  ? ('whitelist' as const)
                  : ('blacklist' as const),
                list: [],
              };
            },
            deps: {
              envManager: ENV_MANAGER_TOKEN,
            },
          }),
          provide({
            provide: HOST_PROVIDED_CONTRACTS,
            useValue: {
              providedContracts: [FAKE_API_CLIENT, ROUTES_TOKEN],
            },
          }),
          provide({
            provide: HOST_REQUIRED_CONTRACTS,
            useValue: {
              childAppName: 'contracts',
              requiredContracts: [
                TEST_CHILD_CONTRACT,
                MISSED_HOST_CONTRACT,
                MISSED_HOST_CONTRACT_FALLBACK,
              ],
            },
          }),
          provide({
            provide: HOST_CONTRACTS_FALLBACK,
            // eslint-disable-next-line @typescript-eslint/consistent-type-imports
            useFactory: (): import('@tramvai/module-child-app').HostContractsFallback => {
              return ({ hostDi, missedContracts }) => {
                console.log('missed host contracts', missedContracts);

                missedContracts.forEach((contract) => {
                  if (contract === MISSED_HOST_CONTRACT_FALLBACK) {
                    hostDi.register(
                      provide({
                        provide: MISSED_HOST_CONTRACT_FALLBACK,
                        useValue: () => 'this is host fallback',
                      })
                    );
                  }
                });
              };
            },
          }),
        ]
      : []),
    provide({
      provide: CHILD_APP_RESOLUTION_CONFIGS_TOKEN,
      multi: true,
      useValue: [
        {
          name: 'base',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'base-not-preloaded',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'client-hints',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'commandline',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'error',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'header',
          byTag: {
            latest: {
              version: '0.0.0-stub',
            },
          },
        },
        {
          name: 'react-query',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'router',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'state',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
        {
          name: 'footer',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              baseUrl: 'http://localhost:5041/',
            },
          },
        },
        {
          name: 'loadable',
          byTag: {
            latest: {
              version: '0.0.0-stub',
            },
          },
        },
        {
          name: 'contracts',
          byTag: {
            latest: {
              version: '0.0.0-stub',
              withoutCss: true,
            },
          },
        },
      ],
    }),
  ],
});
