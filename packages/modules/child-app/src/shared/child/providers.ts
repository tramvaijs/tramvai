import flatten from '@tinkoff/utils/array/flatten';
import type { Container } from '@tinkoff/dippy';
import type { Provider } from '@tramvai/core';
import { Scope, optional, provide } from '@tramvai/core';
import { ChildDispatcherContext } from '@tramvai/state';
import {
  CHILD_APP_ACTIONS_REGISTRY_TOKEN,
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
  CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN,
  CHILD_APP_PAGE_COMPONENTS_TOKEN,
  CHILD_APP_PAGE_SERVICE_TOKEN,
} from '@tramvai/tokens-child-app';
import {
  COMPONENT_REGISTRY_TOKEN,
  DISPATCHER_CONTEXT_TOKEN,
  DISPATCHER_TOKEN,
  INITIAL_APP_STATE_TOKEN,
  STORE_MIDDLEWARE,
} from '@tramvai/tokens-common';
import { PAGE_SERVICE_TOKEN } from '@tramvai/tokens-router';
import type { LoadableStats } from '../webpack/moduleFederation';
import { extractorProviders } from './extractorProviders';
import { ChildAppPageService } from '../pageService';

export const getChildProviders = (appDi: Container, loadableStats?: LoadableStats): Provider[] => {
  const parentDispatcherContext = appDi.get(DISPATCHER_CONTEXT_TOKEN);

  return [
    ...extractorProviders(loadableStats),
    provide({
      provide: DISPATCHER_CONTEXT_TOKEN,
      useFactory: ({ dispatcher, middlewares, initialState, parentAllowedStores }) => {
        return new ChildDispatcherContext({
          dispatcher,
          // context will be set later by the CONTEXT_TOKEN
          context: {},
          initialState: initialState ?? { stores: [] },
          middlewares: flatten(middlewares || []),
          parentDispatcherContext,
          parentAllowedStores: flatten(parentAllowedStores || []),
        });
      },
      deps: {
        dispatcher: DISPATCHER_TOKEN,
        middlewares: { token: STORE_MIDDLEWARE, optional: true },
        initialState: { token: INITIAL_APP_STATE_TOKEN, optional: true },
        parentAllowedStores: {
          token: CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: CHILD_APP_PAGE_SERVICE_TOKEN,
      scope: Scope.REQUEST,
      useFactory: (deps) => {
        return new ChildAppPageService(deps);
      },
      deps: {
        actionsRegistry: CHILD_APP_ACTIONS_REGISTRY_TOKEN,
        config: CHILD_APP_INTERNAL_CONFIG_TOKEN,
        componentRegistry: COMPONENT_REGISTRY_TOKEN,
        pageService: PAGE_SERVICE_TOKEN,
        pageComponents: optional(CHILD_APP_PAGE_COMPONENTS_TOKEN),
      },
    }),
  ];
};
