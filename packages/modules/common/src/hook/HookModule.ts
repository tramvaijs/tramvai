import { Scope, declareModule, provide } from '@tinkoff/dippy';
import { TAPABLE_HOOK_FACTORY_TOKEN } from '@tramvai/core';
import { Hooks, TapableHooks } from '@tinkoff/hook-runner';
import { HOOK_TOKEN } from '@tramvai/tokens-common';

export const TramvaiHookModule = declareModule({
  name: 'TramvaiHookModule',
  providers: [
    provide({
      provide: TAPABLE_HOOK_FACTORY_TOKEN,
      scope: Scope.SINGLETON,
      useClass: TapableHooks,
    }),
    provide({
      provide: HOOK_TOKEN,
      scope: Scope.SINGLETON,
      useClass: Hooks,
    }),
  ],
});
