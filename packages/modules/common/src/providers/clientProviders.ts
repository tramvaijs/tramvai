import { commandLineListTokens, Scope, COMMAND_LINE_RUNNER_TOKEN, provide } from '@tramvai/core';
import { INITIAL_APP_STATE_TOKEN } from '@tramvai/tokens-common';

export const providers = [
  provide({
    provide: INITIAL_APP_STATE_TOKEN,
    scope: Scope.REQUEST,
    useFactory: () => {
      let initialState: any;

      try {
        initialState = document.getElementById('__TRAMVAI_STATE__')?.textContent;

        if (!initialState) {
          throw Error('__TRAMVAI_STATE__ element is empty or missing');
        }

        return JSON.parse(initialState);
      } catch (e: any) {
        if ((window as any).logger) {
          const log = (window as any).logger('tramvai-state');

          log.error({
            event: 'initial-state-parse-error',
            error: e,
            initialState,
          });
        } else {
          // if logger is not ready, we still can log this error in inline scripts with error interceptors.
          // force unhandled promise reject, because we don't need to break application here with sync error.
          // eslint-disable-next-line promise/catch-or-return
          Promise.resolve().then(() => {
            throw Object.assign(e, { initialState, event: 'initial-state-parse-error' });
          });
        }

        return {};
      }
    },
  }),
  provide({
    provide: commandLineListTokens.listen,
    useFactory: ({
      commandLineRunner,
    }: {
      commandLineRunner: typeof COMMAND_LINE_RUNNER_TOKEN;
    }) => {
      return function initClientCommand() {
        return commandLineRunner.run('client', 'customer');
      };
    },
    deps: { commandLineRunner: COMMAND_LINE_RUNNER_TOKEN },
    multi: true,
  }),
];
