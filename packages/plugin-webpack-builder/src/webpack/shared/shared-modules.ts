import path from 'node:path';

import type { ConfigService } from '@tramvai/api/lib/config';
import { safeRequire } from '@tramvai/api/lib/utils/require';

import { isDependantLib, isUnifiedVersion } from '../utils/tramvaiVersions';
import type { ModuleFederationSharedObject } from '../types/webpack';

const DEFAULT_DEPENDENCIES_LIST: NonNullable<ConfigService['shared']>['deps'] = [
  '@tramvai/react',
  '@tinkoff/dippy',
  '@tramvai/core',
];

interface sharedDep {
  import: string;
  eager: boolean;
  singleton: boolean;
  requiredVersion?: string;
}

export const getSharedModules = (config: ConfigService): ModuleFederationSharedObject => {
  const { projectType } = config;
  const { deps, defaultTramvaiDependencies } = config.shared ?? {};
  const isChild = projectType === 'child-app';
  const packageJson = safeRequire(path.resolve(config.rootDir, 'package.json'), true);
  let defaultDependenciesList = defaultTramvaiDependencies ? DEFAULT_DEPENDENCIES_LIST : [];

  if (typeof defaultTramvaiDependencies === 'undefined') {
    if (projectType === 'child-app') {
      defaultDependenciesList = DEFAULT_DEPENDENCIES_LIST;
    } else if (projectType === 'application') {
      // add default dependencies only if child-app is in use to minimize bundle size for apps
      // without child-apps
      if (packageJson?.dependencies?.['@tramvai/module-child-app']) {
        defaultDependenciesList = DEFAULT_DEPENDENCIES_LIST;
      }
    }
  }

  return {
    ...defaultDependenciesList.concat(deps!).reduce((acc: Record<string, sharedDep>, dep) => {
      const { name, singleton = false } = typeof dep === 'string' ? { name: dep } : dep;

      acc[name] = {
        import: name,
        eager: !isChild,
        singleton,
      };

      if (config.experiments.autoResolveSharedRequiredVersions) {
        const isTramvai = isUnifiedVersion(name) || isDependantLib(name);
        const version: string | undefined =
          packageJson.dependencies[name] ?? require(`${name}/package.json`)?.version;

        if (isTramvai && version && version !== '0.0.0-stub') {
          acc[name].requiredVersion = version[0].match(/[0-9]/)
            ? `^${version}`
            : // TODO: what about `>`. `<`, `*`, `=`?
              version.replace(/~/, '^');
        } else if (version) {
          acc[name].requiredVersion = version;
        }
      }

      return acc;
    }, {}),
    react: {
      // singleton to be sure the only one version of library is used
      singleton: true,
      // to load this library as soon as possible
      eager: !isChild,
      // set false in child-app to prevent adding library at all at the result build, as it must be placed in root-app
      // for root-app just import module as usual
      import: isChild ? false : 'react',
      requiredVersion: false,
    },
    'react-dom': {
      singleton: true,
      eager: !isChild,
      import: isChild ? false : 'react-dom',
      requiredVersion: false,
    },
    'react/jsx-runtime': {
      singleton: true,
      eager: !isChild,
      import: isChild ? false : 'react/jsx-runtime',
      requiredVersion: false,
    },
    'react/jsx-dev-runtime': {
      singleton: true,
      eager: !isChild,
      import: isChild ? false : 'react/jsx-dev-runtime',
      requiredVersion: false,
    },
  };
};
