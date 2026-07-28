import { createToken, declareModule, provide, Scope } from '@tramvai/core';
import { commandLineListTokens } from '@tramvai/core';
import { createReducer } from '@tramvai/state';
import { COMBINE_REDUCERS } from '@tramvai/tokens-common';

export const INIT_COMMAND_EXECUTED_TOKEN = createToken<{ executed: boolean }>(
  'initCommandExecuted'
);

export const LazyStore = createReducer('lazyStore', { value: 'lazy-loaded' });

export const EdgeCaseModule = declareModule({
  name: 'EdgeCaseModule',
  providers: [
    provide({
      provide: INIT_COMMAND_EXECUTED_TOKEN,
      scope: Scope.SINGLETON,
      useValue: { executed: false },
    }),
    // this command targets `init` stage which has already been executed —
    // it should NOT run
    provide({
      provide: commandLineListTokens.init,
      multi: true,
      useFactory: ({ marker }) => {
        return function lateInitCommand() {
          marker.executed = true;
        };
      },
      deps: { marker: INIT_COMMAND_EXECUTED_TOKEN },
    }),
    // this adds a reducer to COMBINE_REDUCERS multi-token which is already resolved —
    // it should NOT appear in the dispatcher
    provide({
      provide: COMBINE_REDUCERS,
      multi: true,
      useValue: LazyStore,
    }),
  ],
});
