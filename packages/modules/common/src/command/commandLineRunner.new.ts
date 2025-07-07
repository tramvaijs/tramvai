import type { MultiTokenInterface, Provider } from '@tinkoff/dippy';
import { createChildContainer } from '@tinkoff/dippy';
import { ExecutionAbortError, isSilentError } from '@tinkoff/errors';
import type {
  AsyncTapableHookInstance,
  CommandLineDescription,
  CommandLineRunnerPlugin,
  CommandLines,
} from '@tramvai/core';
import type {
  COMMAND_LINES_TOKEN,
  Command,
  DI_TOKEN,
  ExtractDependencyType,
  CommandLineRunner as Interface,
  TAPABLE_HOOK_FACTORY_TOKEN,
} from '@tramvai/core';
import {
  ROOT_EXECUTION_CONTEXT_TOKEN,
  type EXECUTION_CONTEXT_MANAGER_TOKEN,
  type ExecutionContext,
  type LOGGER_TOKEN,
} from '@tramvai/tokens-common';
import {
  COMMAND_LINE_TIMING_INFO_TOKEN,
  type COMMAND_LINE_EXECUTION_END_TOKEN,
  type CommandLineTimingInfo,
} from '@tramvai/tokens-core-private';

type Container = ExtractDependencyType<typeof DI_TOKEN>;
type Lines = ExtractDependencyType<typeof COMMAND_LINES_TOKEN>;

export type CommandEnvironment = 'server' | 'client';
export type CommandLine = 'init' | 'customer' | 'spa' | 'afterSpa' | 'close';
type LoggerFactory = ExtractDependencyType<typeof LOGGER_TOKEN>;
type HookFactory = ExtractDependencyType<typeof TAPABLE_HOOK_FACTORY_TOKEN>;
type ExecutionContextManager = ExtractDependencyType<typeof EXECUTION_CONTEXT_MANAGER_TOKEN>;
type ExecutionEndHandlers = ExtractDependencyType<typeof COMMAND_LINE_EXECUTION_END_TOKEN> | null;

export class CommandLineRunner implements Interface {
  private rootDi: Container;
  private log: ReturnType<LoggerFactory>;
  private hookFactory: HookFactory;
  private plugins: CommandLineRunnerPlugin[] | null;
  private executionContextManager: ExecutionContextManager;
  private executionEndHandlers: ExecutionEndHandlers;
  private executionContextByDi = new WeakMap<Container, ExecutionContext>();
  private abortControllerByDi = new WeakMap<Container, AbortController>();

  public lines: Lines;

  public runLineHook: AsyncTapableHookInstance<{
    env: keyof CommandLines;
    line: keyof CommandLineDescription;
    di: Container;
    key?: string | number;
  }>;

  public runCommandHook: AsyncTapableHookInstance<{
    env: keyof CommandLines;
    line: keyof CommandLineDescription;
    di: Container;
    command: MultiTokenInterface<Command>;
  }>;

  public runCommandFnHook: AsyncTapableHookInstance<{
    fn: Command;
    line: keyof CommandLineDescription;
    command: MultiTokenInterface<Command>;
    di: Container;
  }>;

  constructor({
    rootDi,
    lines,
    logger,
    plugins,
    hookFactory,
    executionContextManager,
    executionEndHandlers,
  }: {
    rootDi: Container;
    lines: Lines;
    logger: LoggerFactory;
    plugins: CommandLineRunnerPlugin[] | null;
    hookFactory: HookFactory;
    executionContextManager: ExecutionContextManager;
    executionEndHandlers: ExecutionEndHandlers;
  }) {
    this.rootDi = rootDi;
    this.lines = lines;
    this.hookFactory = hookFactory;
    this.plugins = plugins;
    this.executionContextManager = executionContextManager;
    this.executionEndHandlers = executionEndHandlers;
    this.log = logger('command:command-line-runner');

    this.runLineHook = this.hookFactory.createAsync('runLine');
    this.runCommandHook = this.hookFactory.createAsync('runCommand');
    this.runCommandFnHook = this.hookFactory.createAsync('runCommandFn');

    this.runLineHook.tapPromise('commandLineRunner', async (_, { env, line, di, key }) => {
      const commands = this.lines[env][line];
      const timingInfo: CommandLineTimingInfo = {};

      di.register({ provide: COMMAND_LINE_TIMING_INFO_TOKEN, useValue: timingInfo });

      this.log.debug({
        event: 'command-run',
        type: env,
        status: line,
      });

      try {
        for (const command of commands) {
          // emulate old `CommandLineRunner` behavior, important for race conditions at client-side,
          // when new line executes in the middle of current line, and we need cleanup current line before
          await Promise.resolve();

          await this.runCommandHook.callPromise({
            env,
            line,
            di,
            command,
          });
        }
      } finally {
        this.executionContextByDi.delete(di);
        this.abortControllerByDi.delete(di);

        for (const executionEndHandler of this.executionEndHandlers!) {
          executionEndHandler(di, env, line, timingInfo, key);
        }
      }
    });

    this.runCommandHook.tapPromise('commandLineRunner', async (_, { env, line, di, command }) => {
      const commands = di.get({ token: command, optional: true });

      if (!commands) {
        return;
      }

      const rootExecutionContext = di.get({ token: ROOT_EXECUTION_CONTEXT_TOKEN, optional: true });
      const timingInfo = di.get(COMMAND_LINE_TIMING_INFO_TOKEN);
      const commandName = command.toString();

      timingInfo[commandName] = { start: performance.now() };

      return this.executionContextManager
        .withContext<void>(
          rootExecutionContext,
          `command-line:${commandName}`,
          async (executionContext, abortController) => {
            this.executionContextByDi.set(di, executionContext);
            this.abortControllerByDi.set(di, abortController);

            if (!Array.isArray(commands)) {
              await this.runCommandFnHook.callPromise({ fn: commands, line, command, di });
            } else {
              await Promise.all(
                commands.map((fn) => {
                  return this.runCommandFnHook.callPromise({ fn, line, command, di });
                })
              );
            }
          }
        )
        .finally(() => {
          timingInfo[commandName].end = performance.now();
        });
    });

    this.runCommandFnHook.tapPromise('commandLineRunner', async (_, { fn, line, command, di }) => {
      try {
        await this.executeCommand(fn, command, di);
      } catch (error) {
        // in case if any error happens during line execution results from other line handlers will not be used anyway
        this.abortControllerByDi.get(di)?.abort(
          new ExecutionAbortError({
            message: 'Execution context were aborted because of one of the commands failed',
            contextName: `command-line:${line}:${command.toString()}`,
          })
        );

        throw error;
      }
    });

    this.plugins?.forEach((plugin) => {
      plugin.apply(this);
    });
  }

  async run(
    env: CommandEnvironment,
    line: 'init' | 'customer' | 'spa' | 'afterSpa' | 'close',
    providers?: Provider[],
    customDi?: Container,
    key?: string | number
  ) {
    const di = customDi ?? this.resolveDi(env, line, this.rootDi, providers);

    await this.runLineHook.callPromise({ env, line, di, key });

    return di;
  }

  resolveDi(
    env: CommandEnvironment,
    line: CommandLine,
    rootDi: Container,
    providers?: Provider[]
  ): Container {
    let di = rootDi;

    if (env === 'server' && line === 'customer') {
      di = createChildContainer(di);
    }

    if (providers) {
      providers.forEach((item) => {
        return di.register(item);
      });
    }

    return di;
  }

  resolveExecutionContextFromDi(di: Container): ExecutionContext | null {
    return this.executionContextByDi.get(di) ?? null;
  }

  private async executeCommand(
    command: Command,
    commandToken: MultiTokenInterface<Command>,
    di: Container
  ) {
    const commandName = commandToken.toString();

    if (!(command instanceof Function)) {
      const error =
        new TypeError(`Expected function in line processing "commandLineListTokens.${commandName}", received "${command}".
      Check that all commandLineListTokens providers return functions`);

      if (process.env.NODE_ENV !== 'production') {
        const commands = di.get(commandToken);
        const record = di.getRecord(commandToken.name as any as symbol);

        // need to find stack trace from this specific token provider
        for (let i = 0; i < commands.length; i++) {
          if (commands[i] === command) {
            // @ts-expect-error
            error.stack = `${error.stack}\n---- caused by: ----\n${record.multi[i].stack || ''}`;
          }
        }
      }

      this.log.error({
        event: 'line-error',
        error,
        line: commandName,
      });

      return;
    }

    const { name = '' } = command;

    this.log.debug({
      event: 'line-run',
      line: commandName,
      command: name,
    });

    try {
      await command();
    } catch (error: any) {
      this.log[isSilentError(error) ? 'debug' : 'error']({
        event: 'line-error',
        error,
        line: commandName,
        command: name,
      });

      throw error;
    }
  }
}
