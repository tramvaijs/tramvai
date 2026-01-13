import { resolve } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import type { PackageManager, PackageManagerOptions } from './PackageManager';
import { NpmPackageManager } from './NpmPackageManager';
import { UnknownPackageManager } from './UnsupportedPackageManager';
import { YarnPackageManager } from './YarnPackageManager';
import { PnpmPackageManager } from './PnpmPackageManager';
import { YarnBerryPackageManager } from './YarnBerryPackageManager';

const checkLockFile = (rootDir: string, lockName: string) => {
  return existsSync(resolve(rootDir, lockName));
};

const getYarnPackageManager = (options: PackageManagerOptions) => {
  // first, fastest, check for yarn version looking at the package.json "packageManager" field
  const packageJson = require(resolve(options.rootDir, 'package.json'));
  const packageManagerField: string = packageJson?.packageManager;

  if (packageManagerField?.startsWith('yarn@')) {
    const version = packageManagerField.replace('yarn@', '').trim();

    if (version.startsWith('1')) {
      return new YarnPackageManager(options);
    }

    return new YarnBerryPackageManager(options);
  }

  // then, check for the presence of .yarnrc.yml file (Yarn Berry)
  if (checkLockFile(options.rootDir, '.yarnrc.yml')) {
    return new YarnBerryPackageManager(options);
  }

  // at last, use slow method of executing `yarn -v` (500-1500ms on different machines)
  const yarnVersion = execSync('yarn -v', { cwd: options.rootDir }).toString().trim();

  if (yarnVersion.startsWith('1')) {
    return new YarnPackageManager(options);
  }

  return new YarnBerryPackageManager(options);
};

export const packageManagerFactory = (
  options: PackageManagerOptions,
  name?: PackageManager['name']
) => {
  switch (name) {
    case 'npm':
      return new NpmPackageManager(options);
    case 'pnpm':
      return new PnpmPackageManager(options);
    case 'yarn':
      return getYarnPackageManager(options);
    default:
      return new UnknownPackageManager(options);
  }
};

export const resolvePackageManager = (
  packageManagerOptions: PackageManagerOptions,
  { throwUnknown = false }: { throwUnknown?: boolean } = {}
): PackageManager => {
  const { rootDir } = packageManagerOptions;
  let packageManager: PackageManager['name'];

  if (checkLockFile(rootDir, 'yarn.lock')) {
    packageManager = 'yarn';
  } else if (checkLockFile(rootDir, 'package-lock.json')) {
    packageManager = 'npm';
  } else if (checkLockFile(rootDir, 'pnpm-lock.yaml')) {
    packageManager = 'pnpm';
  }

  if (throwUnknown) {
    throw new Error(`Cannot find supported packageManager in "${rootDir}"`);
  }

  return packageManagerFactory(packageManagerOptions, packageManager!);
};
