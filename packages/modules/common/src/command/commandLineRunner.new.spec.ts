import { createContainer } from '@tinkoff/dippy';
import { TapableHooks } from '@tinkoff/hook-runner';
import { ExecutionContextManager } from '../executionContext/executionContextManager';
import type { CommandLine } from './commandLineRunner.new';
import { CommandLineRunner } from './commandLineRunner.new';

const lines = {
  server: {
    init: ['A', 'B'],
    customer: ['C', 'D'],
  },
  client: {
    init: ['B', 'A'],
    customer: ['D', 'C'],
  },
};

function generateCommand(name: string, actual: string[]) {
  return function command() {
    return Promise.resolve(name).then((k) => actual.push(k));
  };
}

function generateProvider(provide: string, value: any) {
  return {
    provide,
    useValue: value,
  };
}

const factoryTestActions = (actual: string[]) => {
  const di = createContainer();
  const actions: Array<[string, any]> = [
    ['A', generateCommand('fable', actual)],
    ['B', [generateCommand('book', actual), generateCommand('magic', actual)]],
    ['C', generateCommand('elf', actual)],
    [
      'D',
      [
        generateCommand('gnome', actual),
        generateCommand('dwarf', actual),
        generateCommand('ork', actual),
      ],
    ],
  ];

  actions.forEach((item) => di.register(generateProvider(item[0], item[1])));

  return { di };
};

const LoggerMock: any = (name: any) => ({ log: () => {}, error: () => {}, debug: () => {} });

const ExecutionEndHandlerMock = jest.fn();

function generateBaseIt(type: string, status: CommandLine, result: string[]) {
  const actual: string[] = [];
  const { di } = factoryTestActions(actual);

  const flow = new CommandLineRunner({
    lines: lines as any,
    rootDi: di,
    logger: LoggerMock,
    executionContextManager: new ExecutionContextManager(),
    executionEndHandlers: [ExecutionEndHandlerMock],
    hookFactory: new TapableHooks(),
    plugins: [],
  });

  return flow.run(type as any, status).then(() => {
    expect(actual).toEqual(result);
    expect(ExecutionEndHandlerMock).toHaveBeenCalledTimes(1);
  });
}

describe('CommandLineRunner', () => {
  afterEach(() => {
    ExecutionEndHandlerMock.mockClear();
  });

  // eslint-disable-next-line jest/expect-expect
  it('Запуск действий при инициализации на сервере', () => {
    return generateBaseIt('server', 'init', ['fable', 'book', 'magic']);
  });

  // eslint-disable-next-line jest/expect-expect
  it('Запуск действий при инициализации на клиенте', () => {
    return generateBaseIt('client', 'init', ['book', 'magic', 'fable']);
  });

  // eslint-disable-next-line jest/expect-expect
  it('Запуск действий при создании кастомера на сервере', () => {
    return generateBaseIt('server', 'customer', ['elf', 'gnome', 'dwarf', 'ork']);
  });

  // eslint-disable-next-line jest/expect-expect
  it('Запуск действий при создании кастомера на клиенте', () => {
    return generateBaseIt('client', 'customer', ['gnome', 'dwarf', 'ork', 'elf']);
  });

  describe('Ошибки', () => {
    it('Поломанные зависимости', async () => {
      const di = createContainer();

      di.register({
        provide: 'A',
        multi: true,
        useFactory: () => {
          return () => {};
        },
      });
      di.register({
        provide: 'A',
        multi: true,
        useFactory: () => {
          return () => {};
        },
        deps: {
          dsa: 'fff',
        },
      });

      const flow = new CommandLineRunner({
        lines: lines as any,
        rootDi: di,
        logger: LoggerMock,
        executionContextManager: new ExecutionContextManager(),
        executionEndHandlers: [ExecutionEndHandlerMock],
        hookFactory: new TapableHooks(),
        plugins: [],
      });

      expect.assertions(3);

      expect(ExecutionEndHandlerMock).not.toHaveBeenCalled();

      await expect(flow.run('server', 'init')).rejects.toMatchObject({
        message: 'Token not found "fff" at "A"',
      });

      expect(ExecutionEndHandlerMock).toHaveBeenCalledTimes(1);
    });
  });

  it('hooks and plugins', async () => {
    const { di } = factoryTestActions([]);
    const runLinePluginMock = jest.fn();
    const runCommandPluginMock = jest.fn();
    const runCommandFnPluginMock = jest.fn();
    const plugin = {
      apply(commandLineRunner: CommandLineRunner) {
        commandLineRunner.runLineHook.tapPromise('test', runLinePluginMock);
        commandLineRunner.runCommandHook.tapPromise('test', runCommandPluginMock);
        commandLineRunner.runCommandFnHook.tapPromise('test', runCommandFnPluginMock);
      },
    };

    const flow = new CommandLineRunner({
      lines: lines as any,
      rootDi: di,
      logger: LoggerMock,
      executionContextManager: new ExecutionContextManager(),
      executionEndHandlers: [],
      hookFactory: new TapableHooks(),
      plugins: [plugin],
    });

    expect.assertions(9);

    expect(runLinePluginMock).not.toHaveBeenCalled();
    expect(runCommandPluginMock).not.toHaveBeenCalled();
    expect(runCommandFnPluginMock).not.toHaveBeenCalled();

    await flow.run('server', 'init');

    expect(runLinePluginMock).toHaveBeenCalledWith(
      {},
      { di, env: 'server', line: 'init' },
      undefined
    );
    expect(runCommandPluginMock).toHaveBeenNthCalledWith(
      1,
      {},
      { di, env: 'server', line: 'init', command: 'A' },
      undefined
    );
    expect(runCommandPluginMock).toHaveBeenNthCalledWith(
      2,
      {},
      { di, env: 'server', line: 'init', command: 'B' },
      undefined
    );
    expect(runCommandFnPluginMock).toHaveBeenNthCalledWith(
      1,
      {},
      { di, line: 'init', command: 'A', fn: di.get('A') },
      undefined
    );
    expect(runCommandFnPluginMock).toHaveBeenNthCalledWith(
      2,
      {},
      { di, line: 'init', command: 'B', fn: di.get('B')[0] },
      undefined
    );
    expect(runCommandFnPluginMock).toHaveBeenNthCalledWith(
      3,
      {},
      { di, line: 'init', command: 'B', fn: di.get('B')[1] },
      undefined
    );
  });
});
