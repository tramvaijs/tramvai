import type { Options } from 'execa';
import execa from 'execa';
import chalk from 'chalk';
import type { PackageManagers } from '../questions/packageManager';
import type { TestingFrameworks } from '../questions/testingFramework';
import type { Type } from '../questions/type';

const COMMON_JEST_DEPENDENCIES = [
  '@testing-library/react',
  '@tramvai/test-unit',
  '@tramvai/test-react',
  '@tramvai/test-integration',
  '@tramvai/test-unit-jest',
  '@tramvai/test-integration-jest',
  '@types/jest@^29.0.0',
  'jest@^29.0.0',
  'jest-circus@^29.0.0',
  'jest-environment-jsdom@^29.0.0',
  'ts-node',
];

const DEPS: Record<Type, { dependencies: string[]; jestDevDependencies: string[] }> = {
  app: {
    dependencies: [
      '@tramvai/core',
      '@tramvai/react',
      '@tramvai/state',
      '@tramvai/module-common',
      '@tramvai/module-error-interceptor',
      '@tramvai/module-render',
      '@tramvai/module-router',
      '@tramvai/module-seo',
      '@tramvai/module-server',
      '@tramvai/tokens-render',
      '@tramvai/tokens-router',
      '@tramvai/tokens-router',
      'react',
      'react-dom',
      'tslib@^2.0.3',
    ],
    jestDevDependencies: COMMON_JEST_DEPENDENCIES,
  },
  'child-app': {
    dependencies: [
      '@tramvai/core',
      '@tramvai/react',
      '@tramvai/state',
      '@tramvai/child-app-core',
      'react',
      'react-dom',
      'tslib@^2.0.3',
    ],
    jestDevDependencies: [...COMMON_JEST_DEPENDENCIES, '@tramvai/test-child-app'],
  },
};

const devDependencies = [
  '@tinkoff/eslint-config',
  '@tinkoff/eslint-config-react',
  '@tinkoff/eslint-plugin-tramvai',
  '@tramvai/cli',
  '@types/react',
  'postcss-custom-media',
  'postcss-custom-properties',
  'postcss-modules-values-replace',
  'postcss-nested',
  'husky@^4',
  'lint-staged',
  'prettier-config-tinkoff',
  'typescript',
];

const packagesInstallCommands: Record<PackageManagers, { deps: string[]; devDeps: string[] }> = {
  npm: {
    deps: ['install', '--save', '--package-lock', '--legacy-peer-deps'],
    devDeps: ['install', '--save-dev', '--legacy-peer-deps'],
  },
  yarn: {
    deps: ['add'],
    devDeps: ['add', '--dev'],
  },
  pnpm: {
    deps: ['add'],
    devDeps: ['add', '--save-dev'],
  },
};

export async function installDependencies({
  localDir,
  type,
  packageManager,
  testingFramework,
}: {
  localDir: string;
  type: Type;
  packageManager: PackageManagers;
  testingFramework: TestingFrameworks;
}) {
  const installCommands = packagesInstallCommands[packageManager];
  const options: Options = {
    cwd: localDir,
    env: {
      SKIP_TRAMVAI_MIGRATIONS: 'true',
    },
    stdio: 'inherit',
  };

  console.log(`${chalk.blue('[DEPENDENCIES]')} Installing app dependencies`);

  await execa(packageManager, [...installCommands.deps, ...DEPS[type].dependencies], options);

  console.log(`${chalk.blue('[DEPENDENCIES]')} Installing dev dependencies`);

  await execa(packageManager, [...installCommands.devDeps, ...devDependencies], options);

  if (testingFramework === 'jest') {
    console.log(`${chalk.blue('[DEPENDENCIES]')} Installing jest dependencies`);

    await execa(
      packageManager,
      [...installCommands.devDeps, ...DEPS[type].jestDevDependencies],
      options
    );
  }
}
