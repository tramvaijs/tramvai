import type { ExtractDependencyType } from '@tinkoff/dippy';
import { provide } from '@tinkoff/dippy';
import type { CommandLineRunner, CommandLineRunnerPlugin } from '@tramvai/core';
import { COMMAND_LINE_RUNNER_PLUGIN } from '@tramvai/core';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { OPENTELEMETRY_TRACER_TOKEN } from '../tokens';

type Tracer = ExtractDependencyType<typeof OPENTELEMETRY_TRACER_TOKEN>;

class CommandLineRunnerOpenTelemetryPlugin implements CommandLineRunnerPlugin {
  private tracer: Tracer;

  constructor({ tracer }: { tracer: Tracer }) {
    this.tracer = tracer;
  }

  apply(commandLineRunner: CommandLineRunner) {
    commandLineRunner.runLineHook.wrap(async (_, { env, line, di, key }, next) => {
      return this.tracer.trace(`line ${line}`, { kind: SpanKind.SERVER }, (span) => {
        span.setAttribute('tramvai.scope', 'command_line_runner');
        span.setAttribute('tramvai.command_line_runner.line', line);

        return next({ env, line, di, key });
      });
    });

    commandLineRunner.runCommandHook.wrap(async (_, { env, line, di, command }, next) => {
      const commandName = command.toString();

      return this.tracer.trace(
        `command ${commandName}`,
        { kind: SpanKind.SERVER },
        async (span) => {
          span.setAttribute('tramvai.scope', 'command_line_runner');
          span.setAttribute('tramvai.command_line_runner.line', line);
          span.setAttribute('tramvai.command_line_runner.command', commandName);

          return next({ env, line, di, command });
        }
      );
    });

    commandLineRunner.runCommandFnHook.wrap(async (_, { fn, line, di, command }, next) => {
      const commandName = command.toString();

      return this.tracer.trace(`${commandName} fn`, { kind: SpanKind.SERVER }, async (span) => {
        span.setAttribute('tramvai.scope', 'command_line_runner');
        span.setAttribute('tramvai.command_line_runner.line', line);
        span.setAttribute('tramvai.command_line_runner.command', commandName);
        span.setAttribute('tramvai.command_line_runner.fn', fn.name ?? 'unknown');

        return next({ fn, line, di, command });
      });
    });
  }
}

export const providers = [
  provide({
    provide: COMMAND_LINE_RUNNER_PLUGIN,
    useClass: CommandLineRunnerOpenTelemetryPlugin,
    deps: {
      tracer: OPENTELEMETRY_TRACER_TOKEN,
    },
  }),
];
