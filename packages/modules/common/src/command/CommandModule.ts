import { Module, COMMAND_LINE_RUNNER_TOKEN, COMMAND_LINES_TOKEN, DI_TOKEN } from '@tramvai/core';
import { COMMAND_LINE_EXECUTION_END_TOKEN } from '@tramvai/tokens-core-private';
import {
  EXECUTION_CONTEXT_MANAGER_TOKEN,
  LOGGER_TOKEN,
  COMMAND_LINE_EXECUTION_CONTEXT_TOKEN,
} from '@tramvai/tokens-common';
import { Scope, provide } from '@tinkoff/dippy';
import { CommandLineRunner } from './commandLineRunner';
import { lines } from './defaultLines';

@Module({
  providers: [
    provide({
      // Раннер процессов
      provide: COMMAND_LINE_RUNNER_TOKEN,
      scope: Scope.SINGLETON,
      useClass: CommandLineRunner,
      deps: {
        lines: COMMAND_LINES_TOKEN,
        rootDi: DI_TOKEN,
        logger: LOGGER_TOKEN,
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
      // Дефолтный список команл
      provide: COMMAND_LINES_TOKEN,
      scope: Scope.SINGLETON,
      useValue: lines,
    }),
  ],
})
export class CommandModule {}
