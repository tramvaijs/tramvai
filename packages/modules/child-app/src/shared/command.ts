import { isSilentError } from '@tinkoff/errors';
import type { CommandLineDescription, CommandLines } from '@tramvai/core';
import { COMMAND_LINE_RUNNER_TOKEN, provide } from '@tramvai/core';
import type {
  ChildAppCommandLineRunner,
  ChildAppDiManager,
  ChildAppFinalConfig,
} from '@tramvai/tokens-child-app';
import type { COMMAND_LINE_EXECUTION_CONTEXT_TOKEN } from '@tramvai/tokens-common';
import { ROOT_EXECUTION_CONTEXT_TOKEN, type LOGGER_TOKEN } from '@tramvai/tokens-common';

export class CommandLineRunner implements ChildAppCommandLineRunner {
  private readonly log: ReturnType<typeof LOGGER_TOKEN>;
  private readonly rootCommandLineRunner: typeof COMMAND_LINE_RUNNER_TOKEN;
  private readonly diManager: ChildAppDiManager;
  private readonly commandLineExecutionContext: typeof COMMAND_LINE_EXECUTION_CONTEXT_TOKEN;
  constructor({
    logger,
    rootCommandLineRunner,
    diManager,
    commandLineExecutionContext,
  }: {
    logger: typeof LOGGER_TOKEN;
    rootCommandLineRunner: typeof COMMAND_LINE_RUNNER_TOKEN;
    diManager: ChildAppDiManager;
    commandLineExecutionContext: typeof COMMAND_LINE_EXECUTION_CONTEXT_TOKEN;
  }) {
    this.log = logger('child-app:command-line-runner');
    this.rootCommandLineRunner = rootCommandLineRunner;
    this.diManager = diManager;
    this.commandLineExecutionContext = commandLineExecutionContext;
  }

  async run(
    type: keyof CommandLines,
    status: keyof CommandLineDescription,
    config: ChildAppFinalConfig
  ) {
    const di = this.diManager.getChildDi(config);
    const executionContext = this.commandLineExecutionContext();

    if (!di) {
      return;
    }

    // Root App command line can be aborted before Child App command line run,
    // for example in case of sync `RedirectFoundError` in page action (`resolvePageDeps` command),
    // we need to prevent Child Apps preloading (also on `resolvePageDeps` command)
    if (
      executionContext?.abortSignal?.aborted ||
      (typeof window === 'undefined' && !executionContext)
    ) {
      this.log.error({
        event: 'host-exection-context-aborted',
        message: `Child App command line run was prevented from executing because ${
          executionContext?.abortSignal?.aborted
            ? 'host command line was aborted'
            : 'execution context is already destroyed'
        }`,
        reason: executionContext?.abortSignal.reason,
        type,
        status,
        childApp: { name: config.name, version: config.version, tag: config.tag },
      });
      return;
    }

    try {
      const commandLineRunner = di.get({ token: COMMAND_LINE_RUNNER_TOKEN, optional: true });

      if (commandLineRunner && commandLineRunner !== this.rootCommandLineRunner) {
        // TODO:child-app create independent metrics instance for child apps
        // for now just reuse metrics implementation from root as otherwise it fails after attempt to create metrics instance with the same name
        // @ts-ignore
        commandLineRunner.metricsInstance = this.rootCommandLineRunner.metricsInstance;

        // provide current Root App execution context as Child App root execution context
        if (executionContext) {
          di.register(
            provide({
              provide: ROOT_EXECUTION_CONTEXT_TOKEN,
              useValue: executionContext,
            })
          );
        }

        await commandLineRunner.run(type, status, [], di);
      }
    } catch (error: any) {
      if (error.code !== 'E_STUB') {
        this.log[
          // for example, we don't need to log Child App run as failed in case of RedirectFoundError
          isSilentError(error) || (error.reason && isSilentError(error.reason)) ? 'debug' : 'error'
        ]({
          event: 'run-failed',
          error,
          type,
          status,
          config,
        });
      }
    }
  }
}
