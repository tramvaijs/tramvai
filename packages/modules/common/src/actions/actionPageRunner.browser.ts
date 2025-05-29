import { isSilentError } from '@tinkoff/errors';
import type { Action, ExtractDependencyType, TramvaiAction } from '@tramvai/core';
import { isTramvaiAction } from '@tramvai/core';
import { ACTION_PARAMETERS } from '@tramvai/core';
import type { LOGGER_TOKEN } from '@tramvai/module-log';
import type {
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
  EXECUTION_CONTEXT_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import type { ROUTER_TOKEN } from '@tramvai/tokens-router';
import type { ActionExecution } from './actionExecution';

const DEFAULT_PAYLOAD = {};

export class ActionPageRunner {
  log: ReturnType<ExtractDependencyType<typeof LOGGER_TOKEN>>;
  private isChildAppRunner: boolean;

  constructor(
    private deps: {
      actionExecution: ActionExecution;
      executionContextManager: ExtractDependencyType<typeof EXECUTION_CONTEXT_MANAGER_TOKEN>;
      commandLineExecutionContext: ExtractDependencyType<
        typeof COMMAND_LINE_EXECUTION_CONTEXT_TOKEN
      >;
      logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
      router: ExtractDependencyType<typeof ROUTER_TOKEN>;
      isChildAppRunner: boolean | null;
    }
  ) {
    this.log = deps.logger('action:action-page-runner');
    this.isChildAppRunner = deps.isChildAppRunner ?? false;
  }

  runActions(
    actions: Array<Action | TramvaiAction<any[], any, any>>,
    stopRunAtError: (error: Error) => boolean = () => false
  ) {
    return this.deps.executionContextManager.withContext(
      this.deps.commandLineExecutionContext(),
      { name: 'pageActions', values: { pageActions: true } },
      async (executionContext, abortController) => {
        const unregisterAbortPageActionsHookOnNavigate = this.deps.router.registerHook(
          'beforeNavigate',
          function abortPageActionsOnNavigation() {
            unregisterAbortPageActionsHookOnNavigate();
            abortController.abort('Page actions were aborted because of route changing');
            return Promise.resolve();
          }
        );
        const actionMapper = (action: Action | TramvaiAction<any[], any, any>) => {
          return Promise.resolve()
            .then(() => {
              const promise = this.deps.actionExecution.runInContext(
                executionContext,
                action,
                DEFAULT_PAYLOAD
              );

              return promise;
            })
            .catch((error) => {
              if (!isSilentError(error)) {
                const parameters = isTramvaiAction(action) ? action : action[ACTION_PARAMETERS];

                this.log.error({
                  error,
                  event: `action-execution-error`,
                  message: `An error occurred during "${
                    parameters?.name ?? 'unknown'
                  }" action execution`,
                });
              }

              if (stopRunAtError(error)) {
                if (process.env.NODE_ENV === 'development') {
                  if (this.isChildAppRunner) {
                    // eslint-disable-next-line no-console
                    console.error(
                      `Throwing error ${error.errorName} is not supported in Child Apps, host application command line will not be aborted!`
                    );
                  }
                }
                throw error;
              }
            });
        };

        await Promise.all(actions.map(actionMapper)).finally(() => {
          // unregister hook for abortion of page actions if actions has been executed or stopped
          unregisterAbortPageActionsHookOnNavigate();
        });
      }
    );
  }
}
