import { sync as resolve } from 'resolve';
import type { Validator } from './validator.h';

export const checkSwcDependencies: Validator = async () => {
  const rootDir = process.cwd();
  const packagePath = `@swc/core/package.json`;
  const pathFromCli = resolve(packagePath);
  const pathFromRoot = resolve(packagePath, { basedir: rootDir });
  const pathFromRootToIntegration = resolve(`@tramvai/swc-integration/package.json`, {
    basedir: rootDir,
  });

  let versionFromIntegration = '';
  let versionFromRoot = '_from_root_version_';
  let versionFromCli = '_from_cli_version_';
  try {
    versionFromIntegration = require(pathFromRootToIntegration).dependencies['@swc/core'];
    versionFromRoot = require(pathFromRoot).version;
    versionFromCli = require(pathFromCli).version;
  } catch (e) {}

  const allVersionsAreCorrect =
    versionFromRoot === versionFromCli && versionFromCli === versionFromIntegration;

  if (!versionFromIntegration || allVersionsAreCorrect) {
    return {
      name: 'checkSwcDependencies',
      status: 'ok',
    };
  }

  return {
    name: 'checkSwcDependencies',
    status: 'error',
    message: `Version of @swc/core mismatch between
@tramvai/swc-integration (version: ${versionFromIntegration}),
@tramvai/cli (version: ${versionFromCli}) and
process.cwd() (version: ${versionFromRoot})`,
  };
};
