import {
  Module,
  COMMAND_LINE_RUNNER_TOKEN,
  COMMAND_LINES_TOKEN,
  DI_TOKEN,
  TAPABLE_HOOK_FACTORY_TOKEN,
  COMMAND_LINE_RUNNER_PLUGIN,
} from '@tramvai/core';
import {
  LOGGER_TOKEN,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
  EXECUTION_CONTEXT_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import { Scope, optional, provide } from '@tinkoff/dippy';
import { COMMAND_LINE_EXECUTION_END_TOKEN } from '@tramvai/tokens-core-private';
import { TramvaiHookModule } from '../hook/HookModule';
import { lines } from './defaultLines';
import { CommandLineRunner } from './commandLineRunner.new';

@Module({
  imports: [TramvaiHookModule],
  providers: [
    provide({
      provide: COMMAND_LINE_RUNNER_TOKEN,
      scope: Scope.SINGLETON,
      useClass: CommandLineRunner,
      deps: {
        logger: LOGGER_TOKEN,
        lines: COMMAND_LINES_TOKEN,
        hookFactory: TAPABLE_HOOK_FACTORY_TOKEN,
        plugins: optional(COMMAND_LINE_RUNNER_PLUGIN),
        rootDi: DI_TOKEN,
        executionContextManager: EXECUTION_CONTEXT_MANAGER_TOKEN,
        executionEndHandlers: {
          token: COMMAND_LINE_EXECUTION_END_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
      useFactory: ({ di, commandLineRunner }) => {
        return () => {
          return (commandLineRunner as CommandLineRunner).resolveExecutionContextFromDi(di);
        };
      },
      deps: {
        di: DI_TOKEN,
        commandLineRunner: COMMAND_LINE_RUNNER_TOKEN,
      },
    }),
    provide({
      provide: COMMAND_LINES_TOKEN,
      scope: Scope.SINGLETON,
      useValue: lines,
    }),
  ],
})
export class CommandModule {}
