import { sync as mockResolve } from 'resolve';
import type { Context } from '../../models/context';
import { checkSwcDependencies } from './checkSwcDependencies';
import type { TranspilationLoader, Minifier } from '../../typings/configEntry/cli';

const getContextWithExperimentalOptions = (
  loader: TranspilationLoader,
  minifier: Minifier = 'terser'
) => {
  return {
    config: {
      getProject: () => {
        return {
          experiments: {
            transpilation: {
              loader,
            },
            minifier,
          },
        };
      },
    },
  } as any as Context;
};

const mockSwcIntegration = (version, mockCliVersion, mockRootVersion) => {
  jest.mock(
    `/app/basedir/@tramvai/swc-integration/package.json`,
    () => {
      return { dependencies: { '@swc/core': version } };
    },
    { virtual: true }
  );

  jest.mock(
    `/app/@swc/core/package.json`,
    () => {
      return { version: mockCliVersion };
    },
    { virtual: true }
  );

  jest.mock(
    `/app/basedir/@swc/core/package.json`,
    () => {
      return { version: mockRootVersion };
    },
    { virtual: true }
  );
};

jest.mock('resolve', () => ({
  sync: jest
    .fn((name) => require.resolve(name))
    .mockImplementation((name, { basedir = '' } = {}) => {
      if (basedir) {
        return `/app/basedir/${name}`;
      }

      return `/app/${name}`;
    }),
}));

describe('validators/checkSwcDependencies', () => {
  const mockLog = jest.fn();
  const context = getContextWithExperimentalOptions('swc');

  beforeEach(() => {
    mockLog.mockClear();
    jest.resetModules();
    (mockResolve as jest.Mock).mockClear();
  });

  it('returns ok if there is no @tramvai/swc-integration with babel transpiler', async () => {
    expect(await checkSwcDependencies(getContextWithExperimentalOptions('babel'), {}))
      .toMatchInlineSnapshot(`
      {
        "name": "checkSwcDependencies",
        "status": "ok",
      }
    `);
  });

  it('returns error if there is no @tramvai/swc-integration with swc transpiler', async () => {
    const result = await checkSwcDependencies(getContextWithExperimentalOptions('swc'), {});
    expect(result.message).toBe(
      '@swc/core or @tramvai/swc-integration module is not found. Continue without checking dependencies. Install @tramvai/swc-integration package in case if you use swc-loader/swc-minifier'
    );
    expect(result.status).toBe('error');
  });

  it('returns ok if there is @tramvai/swc-integration with correct version from root & cli', async () => {
    mockSwcIntegration('1.0.0', '1.0.0', '1.0.0');

    expect(await checkSwcDependencies(context, {})).toMatchInlineSnapshot(`
      {
        "name": "checkSwcDependencies",
        "status": "ok",
      }
    `);
  });

  it('returns error if there is @tramvai/swc-integration with different version from root & cli', async () => {
    mockSwcIntegration('1.0.1', '1.0.0', '1.0.0');

    expect(await checkSwcDependencies(context, {})).toMatchInlineSnapshot(`
      {
        "message": "Version of @swc/core mismatch between
      @tramvai/swc-integration (version: 1.0.1),
      @tramvai/cli (version: 1.0.0) and
      process.cwd() (version: 1.0.0)",
        "name": "checkSwcDependencies",
        "status": "error",
      }
    `);
  });

  it('returns error if there is correct version between @tramvai/swc-integration and root but different in cli', async () => {
    mockSwcIntegration('1.0.0', '1.0.1', '1.0.0');

    expect(await checkSwcDependencies(context, {})).toMatchInlineSnapshot(`
      {
        "message": "Version of @swc/core mismatch between
      @tramvai/swc-integration (version: 1.0.0),
      @tramvai/cli (version: 1.0.1) and
      process.cwd() (version: 1.0.0)",
        "name": "checkSwcDependencies",
        "status": "error",
      }
    `);
  });

  it('returns error if there is correct version between @tramvai/swc-integration and cli but different in root', async () => {
    mockSwcIntegration('1.0.0', '1.0.0', '1.0.1');

    expect(await checkSwcDependencies(context, {})).toMatchInlineSnapshot(`
      {
        "message": "Version of @swc/core mismatch between
      @tramvai/swc-integration (version: 1.0.0),
      @tramvai/cli (version: 1.0.0) and
      process.cwd() (version: 1.0.1)",
        "name": "checkSwcDependencies",
        "status": "error",
      }
    `);
  });
  it('returns ok with babel transpiler', async () => {
    expect(await checkSwcDependencies(getContextWithExperimentalOptions('babel'), {}))
      .toMatchInlineSnapshot(`
      {
        "name": "checkSwcDependencies",
        "status": "ok",
      }
    `);
  });

  it('returns ok with terser transpiler', async () => {
    expect(await checkSwcDependencies(getContextWithExperimentalOptions('babel', 'terser'), {}))
      .toMatchInlineSnapshot(`
      {
        "name": "checkSwcDependencies",
        "status": "ok",
      }
    `);
  });

  it('returns error with swc transpiler', async () => {
    mockSwcIntegration('1.0.0', '1.0.0', '1.0.1');

    expect(await checkSwcDependencies(getContextWithExperimentalOptions('babel', 'swc'), {}))
      .toMatchInlineSnapshot(`
      {
        "message": "Version of @swc/core mismatch between
      @tramvai/swc-integration (version: 1.0.0),
      @tramvai/cli (version: 1.0.0) and
      process.cwd() (version: 1.0.1)",
        "name": "checkSwcDependencies",
        "status": "error",
      }
    `);
  });
});
