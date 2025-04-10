import path from 'path';
import type { EnvTemplate } from '@tramvai/tokens-common';
import { EnvParameter } from '@tramvai/tokens-common';
import { EnvironmentManagerServer } from './EnvironmentManagerServer';

const fileMock = ({ mockEnvJs = {}, mockEnv = {} }) => {
  jest.mock(path.resolve(process.cwd(), 'server', `env.js`), () => mockEnvJs, { virtual: true });
  jest.mock(path.resolve(process.cwd(), `env.development.js`), () => mockEnv, { virtual: true });
};

describe('EnvironmentManagerServer', () => {
  let originalProcessEnv;

  beforeEach(() => {
    originalProcessEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalProcessEnv };
  });

  it('Получение из файлов env параметров', () => {
    fileMock({
      mockEnvJs: { TINKOFF_API: 'https://tinkoff.ru/api' },
      mockEnv: { CFG_API: 'https://cfg.tinkoff.ru' },
    });
    const envManager = new EnvironmentManagerServer([{ key: 'TINKOFF_API' }, { key: 'CFG_API' }]);

    expect(envManager.getAll()).toEqual({
      CFG_API: 'https://cfg.tinkoff.ru',
      TINKOFF_API: 'https://tinkoff.ru/api',
    });
  });

  it('Получение параметров предустановленых приложением', () => {
    fileMock({
      mockEnvJs: { TINKOFF_API: 'https://tinkoff.ru/api' },
    });

    const envManager = new EnvironmentManagerServer([
      { key: 'TINKOFF_API', value: 'API' },
      {
        key: 'CFG_API',
        value: 'API',
        validator: (value) => (value[0] === 'A' ? true : 'Ошибка'),
      },
    ]);

    expect(envManager.getAll()).toEqual({
      CFG_API: 'API',
      TINKOFF_API: 'https://tinkoff.ru/api',
    });
  });

  it('Используется последний предустановленный параметр на одну env', () => {
    fileMock({
      mockEnvJs: {},
    });

    const envManager = new EnvironmentManagerServer([
      { key: 'TINKOFF_API', value: 'FIRST_API' },
      { key: 'TINKOFF_API', value: 'SECOND_API' },
    ]);

    expect(envManager.getAll()).toEqual({
      TINKOFF_API: 'SECOND_API',
    });
  });

  it('Ошибка, если токен не был найден', () => {
    fileMock({});

    expect(() => new EnvironmentManagerServer([{ key: 'TINKOFF_API' }])).toThrow(
      'Env parameter TINKOFF_API not found.'
    );
  });
  it('Опциональные токены', () => {
    fileMock({});

    const envManager = new EnvironmentManagerServer([{ key: 'TINKOFF_API', optional: true }]);

    expect(envManager.getAll()).toEqual({
      TINKOFF_API: undefined,
    });
  });
  it('Валидация токенов - создается ошибка', () => {
    fileMock({
      mockEnv: { CFG_API: 'https://cfg.tinkoff.ru' },
    });
    expect(
      () =>
        new EnvironmentManagerServer([
          {
            key: 'CFG_API',
            validator: (value) => {
              return value[value.length - 1] === '/' ? true : 'Нет слеша на конце';
            },
          },
        ])
    ).toThrow(
      'Env parameter CFG_API with value https://cfg.tinkoff.ru not valid, message: Нет слеша на конце'
    );
  });
  it('Валидация токенов - проходи успешно', () => {
    fileMock({
      mockEnv: { CFG_API: 'https://cfg.tinkoff.ru/' },
    });
    const envManager = new EnvironmentManagerServer([
      {
        key: 'CFG_API',
        validator: (value) => {
          return value[value.length - 1] === '/' ? true : 'Нет слеша на конце';
        },
      },
    ]);
    expect(envManager.getAll()).toEqual({
      CFG_API: 'https://cfg.tinkoff.ru/',
    });
  });

  it('Передача только необходимых данныех клиенту', () => {
    fileMock({
      mockEnvJs: { TINKOFF_API: 'https://tinkoff.ru/api' },
      mockEnv: { CFG_API: 'https://cfg.tinkoff.ru' },
    });
    const envManager = new EnvironmentManagerServer([
      { key: 'TINKOFF_API' },
      { key: 'CFG_API', dehydrate: false },
    ]);

    expect(envManager.getAll()).toEqual({
      CFG_API: 'https://cfg.tinkoff.ru',
      TINKOFF_API: 'https://tinkoff.ru/api',
    });
    expect(envManager.clientUsed()).toEqual({
      TINKOFF_API: 'https://tinkoff.ru/api',
    });
  });

  it('При регистрации обычного и опционального токена с одним названием, он становится обязательным, опциональный в конце', () => {
    fileMock({});

    expect(
      () =>
        new EnvironmentManagerServer([
          { key: 'TINKOFF_API' },
          { key: 'TINKOFF_API', optional: true },
        ])
    ).toThrow('Env parameter TINKOFF_API not found.');
  });

  it('При регистрации обычного и опционального токена с одним названием, он становится обязательным, опциональный в начале', () => {
    fileMock({});

    expect(
      () =>
        new EnvironmentManagerServer([
          { key: 'TINKOFF_API', optional: true },
          { key: 'TINKOFF_API' },
        ])
    ).toThrow('Env parameter TINKOFF_API not found.');
  });

  it('При регистрации общего и серверного токена с одним названием, он становится общим, серверный в конце', () => {
    fileMock({
      mockEnvJs: { TINKOFF_API: 'https://tinkoff.ru/api' },
    });

    const envManager = new EnvironmentManagerServer([
      { key: 'TINKOFF_API' },
      { key: 'TINKOFF_API', dehydrate: false },
    ]);

    expect(envManager.clientUsed()).toEqual({
      TINKOFF_API: 'https://tinkoff.ru/api',
    });
  });

  it('При регистрации общего и серверного токена с одним названием, он становится общим, серверный в начале', () => {
    fileMock({
      mockEnvJs: { TINKOFF_API: 'https://tinkoff.ru/api' },
    });

    const envManager = new EnvironmentManagerServer([
      { key: 'TINKOFF_API', dehydrate: false },
      { key: 'TINKOFF_API' },
    ]);

    expect(envManager.clientUsed()).toEqual({
      TINKOFF_API: 'https://tinkoff.ru/api',
    });
  });

  it('При регистрации валидного и невалидного токена с одним названием, он становится невалидным, валидный в начале', () => {
    fileMock({
      mockEnv: { CFG_API: 'https://cfg.tinkoff.ru' },
    });
    expect(
      () =>
        new EnvironmentManagerServer([
          {
            key: 'CFG_API',
            validator: (value) => {
              return true;
            },
          },
          {
            key: 'CFG_API',
            validator: (value) => {
              return value[value.length - 1] === '/' ? true : 'Нет слеша на конце';
            },
          },
        ])
    ).toThrow(
      'Env parameter CFG_API with value https://cfg.tinkoff.ru not valid, message: Нет слеша на конце'
    );
  });

  it('При регистрации валидного и невалидного токена с одним названием, он становится невалидным, валидный в конце', () => {
    fileMock({
      mockEnv: { CFG_API: 'https://cfg.tinkoff.ru' },
    });
    expect(
      () =>
        new EnvironmentManagerServer([
          {
            key: 'CFG_API',
            validator: (value) => {
              return value[value.length - 1] === '/' ? true : 'Нет слеша на конце';
            },
          },
          {
            key: 'CFG_API',
            validator: (value) => {
              return true;
            },
          },
        ])
    ).toThrow(
      'Env parameter CFG_API with value https://cfg.tinkoff.ru not valid, message: Нет слеша на конце'
    );
  });

  describe('should apply templates', () => {
    const envTokens = [
      {
        key: 'ONE_KEY',
        value: 'http://www.$[host].com/',
        dehydrate: true,
      },
      {
        key: 'MULTI_KEYS',
        value: 'http://www.$[host].com/$[path]/',
        dehydrate: true,
      },
      {
        key: 'ONE_PARAM',
        value: 'http://www.$[host:foo].com/',
        dehydrate: true,
      },
      {
        key: 'MULTI_PARAMS',
        value: 'http://www.$[host:foo,bar].com/',
        dehydrate: true,
      },
    ];
    const templates: EnvTemplate[] = [
      {
        key: 'host',
        fn: (...params: any[]) => {
          if (params.length === 0) {
            return 'test';
          }
          if (params.length === 1) {
            return params[0];
          }
          if (params.length === 2) {
            return params[1];
          }
        },
      },
      {
        key: 'path',
        fn: () => {
          return 'path';
        },
      },
    ];

    let envManager: EnvironmentManagerServer;

    beforeEach(() => {
      envManager = new EnvironmentManagerServer(envTokens, templates);
    });

    it('one template in env string', () => {
      expect(envManager.get('ONE_KEY')).toBe('http://www.test.com/');
    });

    it('multiple templates in env string', () => {
      expect(envManager.get('MULTI_KEYS')).toBe('http://www.test.com/path/');
    });

    it('one parameter for template', () => {
      expect(envManager.get('ONE_PARAM')).toBe('http://www.foo.com/');
    });

    it('multiple parameters for template', () => {
      expect(envManager.get('MULTI_PARAMS')).toBe('http://www.bar.com/');
    });
  });

  describe('should throw when template not found', () => {
    const envTokens = [
      {
        key: 'API_URL',
        value: 'http://www.$[unknown].com/',
        dehydrate: true,
      },
    ];
    const templates: EnvTemplate[] = [];

    it('unknown template', () => {
      expect(() => new EnvironmentManagerServer(envTokens, templates)).toThrow(
        'Problem with "API_URL=http://www.$[unknown].com/" env variable - template for $[unknown] not found.'
      );
    });
  });
});
