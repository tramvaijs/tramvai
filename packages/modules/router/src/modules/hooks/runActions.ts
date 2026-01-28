import uniq from '@tinkoff/utils/array/uniq';

import { isRedirectFoundError } from '@tinkoff/errors';
import type {
  ACTION_REGISTRY_TOKEN,
  ACTION_PAGE_RUNNER_TOKEN,
  STORE_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
  ACTION_EXECUTION_TOKEN,
} from '@tramvai/tokens-common';

import type { ROUTER_TOKEN } from '@tramvai/tokens-router';
import { ACTION_PARAMETERS } from '@tramvai/core';
import { stopRunAtError } from '../utils/stopRunAtError';

export const getActions = ({
  store,
  router,
  actionRegistry,
  actionPageRunner,
}: {
  store: typeof STORE_TOKEN;
  router: typeof ROUTER_TOKEN;
  actionRegistry: typeof ACTION_REGISTRY_TOKEN;
  actionPageRunner: typeof ACTION_PAGE_RUNNER_TOKEN;
}) => {
  const route = router.getCurrentRoute();
  const { config: { bundle, pageComponent } = {} } = route;

  if (!bundle || !pageComponent) {
    throw new Error(`bundle and pageComponent should be defined, but got ${route}`);
  }

  return uniq([
    ...(actionRegistry.getGlobal() || []),
    ...(actionRegistry.get(bundle) || []),
    ...(actionRegistry.get(pageComponent) || []),
  ]);
};

export const runActionsFactory = (deps: {
  store: typeof STORE_TOKEN;
  router: typeof ROUTER_TOKEN;
  actionRegistry: typeof ACTION_REGISTRY_TOKEN;
  actionPageRunner: typeof ACTION_PAGE_RUNNER_TOKEN;
}) => {
  return function runActions() {
    const actions = getActions(deps);

    return deps.actionPageRunner.runActions(actions, stopRunAtError).catch((err) => {
      if (isRedirectFoundError(err)) {
        return deps.router.navigate({
          url: err.nextUrl,
          replace: true,
          code: err.httpStatus,
        });
      }

      throw err.error || err;
    });
  };
};

export const resetDeferredActions = (deps: {
  store: typeof STORE_TOKEN;
  router: typeof ROUTER_TOKEN;
  actionRegistry: typeof ACTION_REGISTRY_TOKEN;
  actionPageRunner: typeof ACTION_PAGE_RUNNER_TOKEN;
  deferredActionsMap: typeof DEFERRED_ACTIONS_MAP_TOKEN;
  actionExecution: typeof ACTION_EXECUTION_TOKEN;
}) => {
  const actions = getActions(deps);

  actions.forEach((action) => {
    const parameters = action[ACTION_PARAMETERS];
    const isDeferredAction = parameters?.deferred;
    const deferred = deps.deferredActionsMap.get(parameters?.name);

    // here only deferred actions with always or dynamic conditions will be refreshed
    if (isDeferredAction && deferred && deps.actionExecution.canExecute(action as any)) {
      deferred.reset();
    }
  });
};
