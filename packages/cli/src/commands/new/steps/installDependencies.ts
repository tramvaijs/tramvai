import chalk from 'chalk';
import type { InstallOptions, PackageManager } from '@tinkoff/package-manager-wrapper';
import type { TestingFrameworks } from '../questions/testingFramework';
import type { Type } from '../questions/type';

const COMMON_JEST_DEPENDENCIES = [
  '@playwright/test',
  '@testing-library/react',
  '@tramvai/test-unit',
  '@tramvai/test-react',
  '@tramvai/test-unit-jest',
  '@jest/types@^29.6.3',
  'jest@^29.7.0',
  'jest-environment-jsdom@^29.7.0',
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
  '@tramvai/swc-integration',
  '@types/react',
  'postcss-custom-media',
  'postcss-custom-properties',
  'postcss-modules-values-replace',
  'postcss-nested',
  'husky@^4',
  'lint-staged',
  '@tramvai/prettier-config',
  'typescript',
  'source-map',
  'webpack-sources',
];

const rootDependencies = {
  devDependencies: ['@tramvai/cli'],
  // with monorepo template and workspaces, old `tslib` version can be hoisted in the root
  dependencies: ['tslib@^2.0.3'],
};

function getBaseDeps(type: Type, isDev: boolean) {
  const depsMap = DEPS[type];
  const jestDeps = depsMap.jestDevDependencies;
  const baseDeps = isDev ? devDependencies : depsMap.dependencies;
  const rootDeps = rootDependencies[isDev ? 'devDependencies' : 'dependencies'];

  return { rootDeps, baseDeps, jestDeps };
}

function getDeps(type: Type, options?: { isDev?: boolean; isRoot?: boolean }) {
  const { rootDeps, baseDeps } = getBaseDeps(type, options?.isDev);

  return [...rootDeps, ...baseDeps];
}

function getDepsWorkspace(type: Type, options?: { isDev?: boolean; isRoot?: boolean }) {
  const { rootDeps, baseDeps } = getBaseDeps(type, options?.isDev);

  if (options?.isRoot) {
    return rootDeps;
  }

  return baseDeps;
}

function getJestDeps(type: Type) {
  return getBaseDeps(type, true).jestDeps;
}

export async function installDependencies({
  localDir,
  type,
  packageManager,
  testingFramework,
  workspace,
}: {
  localDir: string;
  type: Type;
  packageManager: PackageManager;
  testingFramework: TestingFrameworks;
  workspace?: string;
}) {
  const deps = workspace ? getDepsWorkspace : getDeps;

  const options: InstallOptions = {
    cwd: localDir,
    env: {
      SKIP_TRAMVAI_MIGRATIONS: 'true',
    },
    stdio: 'inherit',
    workspace,
  };

  // Install cli and core packages into the root of repository if using workspaces for update command to work correctly
  if (workspace !== undefined) {
    console.log(`${chalk.blue('[DEPENDENCIES]')} Installing root dev dependencies`);

    await packageManager.install({
      packageNames: deps(type, { isDev: true, isRoot: true }),
      devDependency: true,
      ...options,
      workspace: undefined,
    });

    console.log(`${chalk.blue('[DEPENDENCIES]')} Installing root dependencies`);

    await packageManager.install({
      packageNames: deps(type, { isDev: false, isRoot: true }),
      devDependency: false,
      ...options,
      workspace: undefined,
    });
  }

  console.log(`${chalk.blue('[DEPENDENCIES]')} Installing app dependencies`);

  await packageManager.install({
    packageNames: deps(type),
    ...options,
  });

  console.log(`${chalk.blue('[DEPENDENCIES]')} Installing dev dependencies`);

  await packageManager.install({
    packageNames: deps(type, { isDev: true }),
    devDependency: true,
    ...options,
  });

  if (testingFramework === 'jest') {
    console.log(`${chalk.blue('[DEPENDENCIES]')} Installing jest dependencies`);

    await packageManager.install({
      packageNames: getJestDeps(type),
      devDependency: true,
      ...options,
    });
  }
}
