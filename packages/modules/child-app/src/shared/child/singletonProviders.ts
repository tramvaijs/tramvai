import flatten from '@tinkoff/utils/array/flatten';
import type { Container } from '@tinkoff/dippy';
import type { Provider } from '@tramvai/core';
import { APP_INFO_TOKEN, Scope, optional, provide } from '@tramvai/core';
import { ActionRegistry } from '@tramvai/module-common';
import {
  COMPONENT_REGISTRY_TOKEN,
  LOGGER_TOKEN,
  DISPATCHER_CONTEXT_TOKEN,
  DISPATCHER_TOKEN,
  INITIAL_APP_STATE_TOKEN,
  STORE_MIDDLEWARE,
  ASYNC_LOCAL_STORAGE_TOKEN,
  LIMIT_ACTION_GLOBAL_TIME_RUN,
  ACTION_CONDITIONALS,
  DEFERRED_ACTIONS_MAP_TOKEN,
  EXECUTION_CONTEXT_MANAGER_TOKEN,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
  PUBSUB_TOKEN,
  PUBSUB_FACTORY_TOKEN,
} from '@tramvai/tokens-common';
import { RENDER_SLOTS } from '@tramvai/tokens-render';
import {
  CHILD_APP_ACTIONS_REGISTRY_TOKEN,
  CHILD_APP_INTERNAL_ACTION_TOKEN,
  CHILD_REQUIRED_CONTRACTS,
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
  CHILD_APP_INTERNAL_ROOT_STATE_ALLOWED_STORE_TOKEN,
  CHILD_APP_PAGE_COMPONENTS_TOKEN,
  CHILD_APP_PAGE_SERVICE_TOKEN,
  CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN,
} from '@tramvai/tokens-child-app';
import {
  LINK_PREFETCH_MANAGER_TOKEN,
  PAGE_SERVICE_TOKEN,
  ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
  ROUTER_TOKEN,
} from '@tramvai/tokens-router';
import { ChildDispatcherContext } from '@tramvai/state';
import { getChildProviders as getChildEndProviders } from '../../server/child/singletonProviders';
import { extractorProviders } from './extractorProviders';
import type { LoadableStats } from '../webpack/moduleFederation';
import { ChildAppPageService } from '../pageService';

export const getChildProviders = (appDi: Container, loadableStats: LoadableStats): Provider[] => {
  const logger = appDi.get(LOGGER_TOKEN);

  return [
    provide({
      provide: LOGGER_TOKEN,
      useValue: Object.assign((opts: any) => {
        return logger('child-app').child(opts);
      }, logger),
    }),
    provide({
      provide: RENDER_SLOTS,
      multi: true,
      useValue: [],
    }),
    provide({
      provide: CHILD_APP_ACTIONS_REGISTRY_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ actionsList }) => {
        return new ActionRegistry({ actionsList: flatten(actionsList) });
      },
      deps: {
        actionsList: CHILD_APP_INTERNAL_ACTION_TOKEN,
      },
    }),
    provide({
      provide: CHILD_REQUIRED_CONTRACTS,
      useValue: [
        ROUTER_TOKEN,
        COMPONENT_REGISTRY_TOKEN,
        PAGE_SERVICE_TOKEN,
        LINK_PREFETCH_MANAGER_TOKEN,
        ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
        LIMIT_ACTION_GLOBAL_TIME_RUN,
      ],
    }),
    // for backward compatibility, when:
    // - host app is modern (with contracts)
    // - child app is legacy (<= v3.x.x, without contracts)
    // - DI is isolated
    // in legacy tramvai versions, this tokens is not borrowed in CommonChildAppModule
    provide({
      provide: CHILD_APP_INTERNAL_ROOT_DI_BORROW_TOKEN,
      multi: true,
      useValue: [
        APP_INFO_TOKEN,
        ACTION_CONDITIONALS,
        DEFERRED_ACTIONS_MAP_TOKEN,
        EXECUTION_CONTEXT_MANAGER_TOKEN,
        COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
        PUBSUB_TOKEN,
        PUBSUB_FACTORY_TOKEN,
      ],
    }),
    ...getChildEndProviders(appDi),
    ...extractorProviders(loadableStats),
    provide({
      provide: DISPATCHER_CONTEXT_TOKEN,
      scope: Scope.REQUEST,
      useFactory: ({ dispatcher, middlewares, initialState, parentAllowedStores }) => {
        const parentDispatcherContext =
          appDi
            .get(optional(ASYNC_LOCAL_STORAGE_TOKEN))
            ?.getStore()
            ?.tramvaiRequestDi?.get(DISPATCHER_CONTEXT_TOKEN) ??
          appDi.get(DISPATCHER_CONTEXT_TOKEN);

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
