import { resolveReactVersion } from '../../../utils/resolveReactVersion';
import type { ReactCompilerOptions } from '../../../typings/configEntry/cli';

type ReactCompilerTarget = '17' | '18' | '19';

const resolveTarget = (): ReactCompilerTarget => {
  const resolved = resolveReactVersion();
  const major = resolved.major.toString() as ReactCompilerTarget;

  if (['17', '18', '19'].includes(major)) {
    return major;
  }

  throw new Error(
    `Resolved React version is ${resolved.version} which is not supported. Supported versions are 17, 18 and 19.`
  );
};

export const getReactCompilerPlugin = ({
  options,
  isServer,
}: {
  options: boolean | ReactCompilerOptions;
  isServer: boolean;
}) => {
  if (!options || isServer) {
    return undefined;
  }

  const compilerOptions = typeof options === 'boolean' ? {} : options;

  return [
    'babel-plugin-react-compiler',
    {
      ...compilerOptions,
      target: resolveTarget(),
    },
  ];
};
