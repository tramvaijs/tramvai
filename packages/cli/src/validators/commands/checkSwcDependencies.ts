import { sync as resolve } from 'resolve';
import type { Validator } from './validator.h';
import type { Experiments, TranspilationLoader, Minifier } from '../../typings/configEntry/cli';

const validator = 'checkSwcDependencies';

const extractFieldFromConfigEntry = <T extends Minifier | TranspilationLoader>(
  experimentField: T,
  defaultValue: T
): T => {
  if (!experimentField) return defaultValue;
  if (typeof experimentField === 'string') {
    return experimentField as T;
  }

  return experimentField[process.env.NODE_ENV] ?? defaultValue;
};

export const checkSwcDependencies: Validator = async (context, parameters) => {
  const configEntry = context.config.getProject(parameters.target);

  const loader = extractFieldFromConfigEntry<TranspilationLoader>(
    (configEntry as any)?.experiments?.transpilation?.loader,
    'babel'
  );
  const minifier = extractFieldFromConfigEntry<Minifier>(
    (configEntry as any)?.experiments?.minifier,
    'terser'
  );

  if (!(loader === 'swc' || minifier === 'swc')) {
    return {
      name: validator,
      status: 'ok',
    };
  }

  const rootDir = process.cwd();
  const packagePath = `@swc/core/package.json`;

  let versionFromIntegration = '';
  let versionFromRoot = '_from_root_version_';
  let versionFromCli = '_from_cli_version_';
  try {
    const pathFromCli = resolve(packagePath);
    const pathFromRoot = resolve(packagePath, { basedir: rootDir });
    const pathFromRootToIntegration = resolve(`@tramvai/swc-integration/package.json`, {
      basedir: rootDir,
    });
    versionFromIntegration = require(pathFromRootToIntegration).dependencies['@swc/core'];
    versionFromRoot = require(pathFromRoot).version;
    versionFromCli = require(pathFromCli).version;
  } catch (e) {
    // https://www.npmjs.com/package/resolve#methods
    if (e.code === 'MODULE_NOT_FOUND') {
      return {
        name: validator,
        status: 'error',
        message:
          '@swc/core or @tramvai/swc-integration module is not found. Continue without checking dependencies. Install @tramvai/swc-integration package in case if you use swc-loader/swc-minifier',
      };
    }

    return {
      name: validator,
      status: 'error',
      message: `Something went wrong while resolving @swc/core or @tramvai/swc-integration packages, error: ${e}`,
    };
  }

  const allVersionsAreCorrect =
    versionFromRoot === versionFromCli && versionFromCli === versionFromIntegration;

  if (!versionFromIntegration || allVersionsAreCorrect) {
    return {
      name: validator,
      status: 'ok',
    };
  }

  return {
    name: validator,
    status: 'error',
    message: `Version of @swc/core mismatch between
@tramvai/swc-integration (version: ${versionFromIntegration}),
@tramvai/cli (version: ${versionFromCli}) and
process.cwd() (version: ${versionFromRoot})`,
  };
};
