import type { Action, ExtractDependencyType, TramvaiAction } from '@tramvai/core';
import { isTramvaiAction } from '@tramvai/core';
import { ACTION_PARAMETERS } from '@tramvai/core';
import type {
  LOGGER_TOKEN,
  ActionPageRunner as ActionPageRunnerInterface,
  STORE_TOKEN,
  EXECUTION_CONTEXT_MANAGER_TOKEN,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
  ACTION_EXECUTION_TOKEN,
  DEFERRED_ACTIONS_MAP_TOKEN,
} from '@tramvai/tokens-common';
import {
  ExecutionAbortError,
  isPageActionsAbortError,
  isSilentError,
  makeErrorSilent,
  PageActionsAbortError,
} from '@tinkoff/errors';
import type {
  SERVER_RESPONSE_STREAM,
  SERVER_RESPONSE_TASK_MANAGER,
} from '@tramvai/tokens-server-private';
import { actionServerStateEvent } from './actionTramvaiReducer';
import { generateDeferredReject, generateDeferredResolve } from './deferred/clientScriptsUtils';

const DEFAULT_PAYLOAD = {};

declare module '@tramvai/tokens-common' {
  interface ExecutionContextValues {
    pageActions?: boolean;
  }
}

export class ActionPageRunner implements ActionPageRunnerInterface {
  private log: ReturnType<ExtractDependencyType<typeof LOGGER_TOKEN>>;
  private deferredMap: ExtractDependencyType<typeof DEFERRED_ACTIONS_MAP_TOKEN>;
  private responseTaskManager: ExtractDependencyType<typeof SERVER_RESPONSE_TASK_MANAGER> | null;
  private serverResponseStream: ExtractDependencyType<typeof SERVER_RESPONSE_STREAM> | null;
  private isChildAppRunner: boolean;

  constructor(
    private deps: {
      store: ExtractDependencyType<typeof STORE_TOKEN>;
      actionExecution: ExtractDependencyType<typeof ACTION_EXECUTION_TOKEN>;
      executionContextManager: ExtractDependencyType<typeof EXECUTION_CONTEXT_MANAGER_TOKEN>;
      commandLineExecutionContext: ExtractDependencyType<
        typeof COMMAND_LINE_EXECUTION_CONTEXT_TOKEN
      >;
      limitTime: number;
      logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
      deferredMap: ExtractDependencyType<typeof DEFERRED_ACTIONS_MAP_TOKEN>;
      responseTaskManager: ExtractDependencyType<typeof SERVER_RESPONSE_TASK_MANAGER> | null;
      serverResponseStream: ExtractDependencyType<typeof SERVER_RESPONSE_STREAM> | null;
      isChildAppRunner: boolean | null;
    }
  ) {
    this.log = deps.logger('action:action-page-runner');
    this.deferredMap = deps.deferredMap;
    this.responseTaskManager = deps.responseTaskManager;
    this.serverResponseStream = deps.serverResponseStream;
    this.isChildAppRunner = deps.isChildAppRunner ?? false;
  }

  // TODO stopRunAtError нужен только для редиректов на стороне сервера в экшенах. И нужно пересмотреть реализацию редиректов
  runActions(
    actions: Array<Action | TramvaiAction<any[], any, any>>,
    stopRunAtError: (error: Error) => boolean = () => false
  ) {
    const actionNames = actions.map((action) => {
      const parameters = isTramvaiAction(action) ? action : action[ACTION_PARAMETERS];
      const actionName = parameters?.name ?? 'unknown';
      return actionName;
    });

    return this.deps.executionContextManager.withContext(
      this.deps.commandLineExecutionContext(),
      { name: 'pageActions', values: { pageActions: true } },
      (executionContext, abortController) => {
        return new Promise<void>((resolve, reject) => {
          const timeoutMarker = setTimeout(() => {
            const unfinishedActions: string[] = [];

            this.deps.actionExecution.execution.forEach((value, key) => {
              if (actionNames.includes(key) && value.status === 'pending') {
                unfinishedActions.push(key);
              }
            });

            this.log.warn({
              event: `actions-execution-timeout`,
              message: `Page actions has exceeded timeout of ${this.deps.limitTime}ms, ignore some results of execution.
You can find more detailed information from "action-execution-error" logs, and find relative logs by using the same "x-request-id" header`,
              unfinishedActions,
            });

            abortController.abort(
              new PageActionsAbortError({
                message: 'Page actions were aborted because of timeout',
                unfinishedActions,
              })
            );

            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            endChecker();
          }, this.deps.limitTime);

          const endChecker = () => {
            clearTimeout(timeoutMarker);
            const result: Record<string, any> = {};
            // TODO: dehydrate only actions on first level as inner actions are running on client despite their execution on server
            this.deps.actionExecution.execution.forEach((value, key) => {
              // get completed actions values, others will be executed on client
              if (actionNames.includes(key) && value.status === 'success') {
                result[key] = value;
              }
            });

            this.syncStateActions(result);
            resolve();
          };

          const actionMapper = (action: Action | TramvaiAction<any[], any, any>) => {
            const isDeferredAction =
              ACTION_PARAMETERS in action && action[ACTION_PARAMETERS].deferred;

            return Promise.resolve()
              .then(() => {
                const promise = this.deps.actionExecution.runInContext(
                  executionContext,
                  action as TramvaiAction<any[], any, any>,
                  DEFAULT_PAYLOAD
                );

                if (isDeferredAction) {
                  this.responseTaskManager?.push(async () => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const deferred = this.deferredMap.get(action.name)!;

                    // scripts will already be present on the page HTML
                    if (deferred.isResolved() || deferred.isRejected()) {
                      return;
                    }

                    // eslint-disable-next-line promise/no-nesting
                    await deferred.promise
                      .then((data: any) => {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.serverResponseStream!.push(
                          `<script>${generateDeferredResolve({
                            key: action.name,
                            data,
                          })}</script>`
                        );
                      })
                      .catch((reason: any) => {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.serverResponseStream!.push(
                          `<script>${generateDeferredReject({
                            key: action.name,
                            error: reason,
                          })}</script>`
                        );
                      });
                  });
                }

                return promise;
              })
              .then((payload) => {
                if (executionContext.abortSignal.aborted) {
                  const parameters = isTramvaiAction(action) ? action : action[ACTION_PARAMETERS];
                  const actionName = parameters?.name ?? 'unknown';
                  const contextName = `${executionContext.name}.${actionName}`;
                  const reasonIsObject = typeof executionContext.abortSignal.reason === 'object';
                  const timeoutError =
                    reasonIsObject && isPageActionsAbortError(executionContext.abortSignal.reason);
                  const silentError =
                    reasonIsObject && isSilentError(executionContext.abortSignal.reason);

                  const executionError = new ExecutionAbortError({
                    message: `Execution aborted in context "${contextName}"`,
                    contextName,
                    reason: executionContext.abortSignal.reason,
                  });

                  if (silentError) {
                    makeErrorSilent(executionError);
                  }

                  this.log[silentError ? 'info' : 'warn']({
                    error: executionError,
                    event: `action-execution-error`,
                    message: `${timeoutError ? `${actionName} has exceeded timeout of ${this.deps.limitTime}ms, execution results will be ignored` : `${actionName} execution error`}.
This action will be automatically executed on client - https://tramvai.dev/docs/features/data-fetching/action#synchronizing-between-server-and-client
If the request in this action takes too long, you can move it to the client using "onlyBrowser" condition or use Deferred Actions.
Also, the necessary network accesses may not be present.`,
                  });
                }

                return payload;
              })
              .catch((error) => {
                const isStopCommandLineError = stopRunAtError(error);

                if (process.env.NODE_ENV === 'development') {
                  if (isStopCommandLineError && this.isChildAppRunner) {
                    console.error(
                      `Throwing error ${error.errorName} is not supported in Child Apps, host application command line will not be aborted!`
                    );
                  }
                }

                const parameters = isTramvaiAction(action) ? action : action[ACTION_PARAMETERS];

                this.log[isSilentError(error) ? 'info' : 'error']({
                  error,
                  event: `action-execution-error`,
                  message: `${parameters?.name ?? 'unknown'} execution error, ${
                    isStopCommandLineError
                      ? `${error.name} error are expected and will stop actions execution and prevent page rendering`
                      : `this action will be automatically executed on client - https://tramvai.dev/docs/features/data-fetching/action#synchronizing-between-server-and-client
If the request in this action takes too long, you can move it to the client using "onlyBrowser" condition or use Deferred Actions.
Also, the necessary network accesses may not be present.`
                  }`,
                });

                if (isStopCommandLineError) {
                  clearTimeout(timeoutMarker);
                  reject(error);
                }
              });
          };

          // eslint-disable-next-line promise/catch-or-return
          Promise.all(actions.map(actionMapper)).then(endChecker);
        });
      }
    );
  }

  private syncStateActions(success: Record<string, any>) {
    return this.deps.store.dispatch(actionServerStateEvent(success));
  }
}
