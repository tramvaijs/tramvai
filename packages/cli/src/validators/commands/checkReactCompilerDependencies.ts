import type { Validator } from './validator.h';
import type { TranspilationLoader } from '../../typings/configEntry/cli';
import type { ApplicationConfigEntry } from '../../typings/configEntry/application';
import { resolveReactVersion } from '../../utils/resolveReactVersion';

type ReactCompilerTarget = '17' | '18' | '19';

const VALIDATOR_NAME = 'checkReactCompilerDependencies';

const getLoaderFromConfig = (config: ApplicationConfigEntry): TranspilationLoader => {
  const field = config.experiments?.transpilation?.loader;

  if (field === undefined) {
    return 'babel';
  }

  if (typeof field === 'string') {
    return field as unknown as TranspilationLoader;
  }

  return field[process.env.NODE_ENV] ?? 'babel';
};

const resolveBabelPlugin = () => {
  try {
    require.resolve('babel-plugin-react-compiler');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'Can not resolve the `babel-plugin-react-compiler`. It is required to use the React Compiler. Please install it.'
      );
    }

    throw error;
  }
};

const resolveCompilerRuntime = (reactMajor: ReactCompilerTarget) => {
  if (reactMajor === '19') {
    return;
  }

  try {
    require.resolve('react-compiler-runtime');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'React versions prior to 19 require the `react-compiler-runtime` package to be installed. Please install it.'
      );
    }

    throw error;
  }
};

export const checkReactCompilerDependencies: Validator = async ({ config }, params) => {
  const configEntry = config.getProject(params.target) as ApplicationConfigEntry;

  if (!configEntry.experiments?.reactCompiler) {
    return { name: VALIDATOR_NAME, status: 'ok' };
  }

  const loader = getLoaderFromConfig(configEntry);

  if (loader === 'swc') {
    throw new Error(`React compiler is not supported when using SWC transpiler.`);
  }

  const reactVersion = resolveReactVersion();
  const reactMajor = reactVersion.major.toString() as ReactCompilerTarget;

  if (!['17', '18', '19'].includes(reactMajor)) {
    throw new Error(
      `Resolved React version is ${reactVersion.version} which is not supported. Supported versions are 17, 18 and 19.`
    );
  }

  resolveBabelPlugin();
  resolveCompilerRuntime(reactMajor);

  return { name: VALIDATOR_NAME, status: 'ok' };
};
