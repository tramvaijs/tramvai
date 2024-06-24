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
      } catch (error: any) {
        // Enrich error information
        if (error instanceof Error) {
          (error as any).event = 'initial-state-parse-error';
          (error as any).initialState = initialState;
          (error as any).readyState = document.readyState;
          (error as any).bodyComplete = !!document.getElementById('__TRAMVAI_BODY_TAIL__');
        }

        throw error;
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
