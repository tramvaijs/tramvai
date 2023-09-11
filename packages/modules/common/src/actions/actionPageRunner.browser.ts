import { isSilentError } from '@tinkoff/errors';
import type { Action, ExtractDependencyType, TramvaiAction } from '@tramvai/core';
import { isTramvaiAction } from '@tramvai/core';
import { ACTION_PARAMETERS } from '@tramvai/core';
import type { LOGGER_TOKEN } from '@tramvai/module-log';
import type {
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
  EXECUTION_CONTEXT_MANAGER_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
} from '@tramvai/tokens-common';
import type { ActionExecution } from './actionExecution';
import { Deferred } from './deferred/deferred';

const DEFAULT_PAYLOAD = {};

export class ActionPageRunner {
  log: ReturnType<ExtractDependencyType<typeof LOGGER_TOKEN>>;

  constructor(
    private deps: {
      actionExecution: ActionExecution;
      executionContextManager: ExtractDependencyType<typeof EXECUTION_CONTEXT_MANAGER_TOKEN>;
      commandLineExecutionContext: ExtractDependencyType<
        typeof COMMAND_LINE_EXECUTION_CONTEXT_TOKEN
      >;
      logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
      deferredMap: ExtractDependencyType<typeof DEFERRED_ACTIONS_MAP_TOKEN>;
    }
  ) {
    this.log = deps.logger('action:action-page-runner');
  }

  runActions(
    actions: Array<Action | TramvaiAction<any[], any, any>>,
    stopRunAtError: (error: Error) => boolean = () => false
  ) {
    return this.deps.executionContextManager.withContext(
      this.deps.commandLineExecutionContext(),
      { name: 'pageActions', values: { pageActions: true } },
      async (executionContext) => {
        const actionMapper = (action: Action | TramvaiAction<any[], any, any>) => {
          const isDeferredAction =
            ACTION_PARAMETERS in action && action[ACTION_PARAMETERS].deferred;

          if (isDeferredAction && !this.deps.deferredMap.get(action.name)) {
            const deferred = new Deferred();
            // avoid unhandled promise rejection
            deferred.promise.catch(() => {});
            this.deps.deferredMap.set(action.name, deferred);
          }

          return Promise.resolve()
            .then(() => {
              const promise = this.deps.actionExecution.runInContext(
                executionContext,
                action,
                DEFAULT_PAYLOAD
              );

              if (isDeferredAction) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const deferred = this.deps.deferredMap.get(action.name)!;

                // @todo check always: true actions
                if (!deferred.isResolved() && !deferred.isRejected()) {
                  // eslint-disable-next-line promise/no-nesting
                  promise.then(deferred.resolve).catch(deferred.reject);
                }

                // eslint-disable-next-line promise/no-return-wrap
                return Promise.resolve();
              }

              return promise;
            })
            .catch((error) => {
              if (!isSilentError(error)) {
                const parameters = isTramvaiAction(action) ? action : action[ACTION_PARAMETERS];

                this.log.error({
                  error,
                  event: `action-execution-error`,
                  message: `${parameters?.name ?? 'uknown'} execution error`,
                });
              }

              if (stopRunAtError(error)) {
                throw error;
              }
            });
        };

        await Promise.all(actions.map(actionMapper));
      }
    );
  }
}
