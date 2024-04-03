import webpack from 'webpack';
import type Config from 'webpack-chain';
import path from 'path';
import { existsSync } from 'fs-extra';
import findCacheDir from 'find-cache-dir';
import { ignoreWarnings } from '../utils/warningsFilter';
import resolve from '../blocks/resolve';
import ignoreLocales from '../blocks/ignoreLocales';
import type { ConfigManager } from '../../../config/configManager';
import { safeRequireResolve } from '../../../utils/safeRequire';
import type { CliConfigEntry } from '../../../typings/configEntry/cli';
import { getPostcssConfigPath } from '../blocks/css';

const filterNonExisted = (filePaths: string[]) => {
  return filePaths.filter((filePath) => {
    return filePath && existsSync(filePath);
  });
};

const getConfigCacheNameAdditionalFlags = (configManager: ConfigManager<CliConfigEntry>) => {
  return [
    configManager.buildType === 'client' && configManager.modern ? 'modern' : '',
    configManager.debug ? 'debug' : '',
    process.env.TRAMVAI_REACT_PROFILE ? 'tramvai_react_profile' : '',
  ]
    .filter(Boolean)
    .join('-');
};

// eslint-disable-next-line import/no-default-export
export default (configManager: ConfigManager<CliConfigEntry>) => (config: Config) => {
  const env = configManager.env === 'development' ? 'dev' : 'prod';

  // uniqueName are used for various webpack internals
  // currently, we use that value in the ModuleFederation glue code
  config.output.set(
    'uniqueName',
    `${configManager.type}:${configManager.name}:${configManager.version}`
  );
  // by default `devtoolNamespace` value is `uniqueName`, but with new `uniqueName` eval sourcemaps are broken
  config.output.set('devtoolNamespace', '@tramvai/cli');

  if (!configManager.debug) {
    config.set('ignoreWarnings', ignoreWarnings);
  }

  config.context(path.resolve(__dirname, '..', '..', '..', '..'));
  config.batch(resolve(configManager));
  config.batch(ignoreLocales());

  config.resolve.symlinks(configManager.resolveSymlinks).end();

  config.optimization.set('checkWasmTypes', false);

  // Так как arrowFunction медленнее обычных https://github.com/webpack/webpack/issues/13125
  config.output.merge({ environment: { arrowFunction: false } });

  // форсим ошибку для ненайденных экспортов, по дефолту показывается warning
  // TODO: пока отключаем для webpack5 пока не устаканится способ работы с json https://github.com/webpack/changelog-v5#json-modules
  // либо везде не заменят импорты json на дефолт
  // config.module.set('strictExportPresence', true);

  // если произошла ошибка при подключении модуля, то не кешировать результат,
  // а каждый раз выкидывать ошибку при подключении такого модуля
  config.output.set('strictModuleExceptionHandling', true);

  /**
   * https://webpack.js.org/configuration/output/#outputhashfunction . When release webpack 6 would need to remove
   *
   * Also fix "digital envelope routines::unsupported" error with Node.js >= 17 version.
   * More info - https://github.com/nodejs/node/issues/40455, https://github.com/webpack/webpack/issues/14532
   * Solution reference - https://github.com/vercel/next.js/pull/30095 (updated `loader-utils` package required)
   */
  config.output.hashFunction('xxhash64').hashDigestLength(16);

  if (configManager.fileCache) {
    config.cache({
      type: 'filesystem',
      name: `${env}-${configManager.type}-${configManager.buildType}-${
        configManager.name
      }-${getConfigCacheNameAdditionalFlags(configManager)}`,
      cacheDirectory: findCacheDir({ cwd: configManager.rootDir, name: 'webpack' }),
      buildDependencies: {
        cli: ['@tramvai/cli'],
        webpack: ['webpack/lib'],
        // first check that config exists. If it is passed to webpack, but file is not exist the cache will not be created at all.
        // It may be missing in cases when cli is running programmaticaly
        config: filterNonExisted([path.resolve(configManager.rootDir, 'tramvai.json')]),
        css: filterNonExisted([
          safeRequireResolve(
            path.resolve(configManager.rootDir, getPostcssConfigPath(configManager)),
            true
          ),
        ]),
      },
      // https://github.com/vercel/next.js/commit/ff5338ce03a3240a97a5c84f5ad5c31c0f53a6ce
      compression: false,
    });
  }

  config.set('snapshot', {
    // отключаем дефолты для managedPaths т.к. из-за них нельзя дебажить node_modules,
    // если же потребуется включить эту опцию, то надо будет выставить `path.resolve(configManager.rootDir, 'node_modules')` чтобы правильно работал tramvai-debug
    managedPaths: [],
  });

  config.set('experiments', configManager.experiments.webpack ?? {});

  config
    .mode('development')
    .optimization.minimize(false)
    .splitChunks(false)
    .end()
    .plugin('define')
    .use(webpack.DefinePlugin, [
      {
        ...configManager.define.shared,
        ...configManager.define[configManager.env],

        'process.env.APP_ID': JSON.stringify(configManager.name || 'common'),
        'process.env.APP_VERSION': process.env.APP_VERSION
          ? JSON.stringify(process.env.APP_VERSION)
          : undefined,

        'process.env.ENABLE_DEVTOOLS':
          process.env.ENABLE_DEVTOOLS || configManager.env === 'development',

        'process.env.DISABLE_EXTERNAL_SCRIPTS': process.env.DISABLE_EXTERNAL_SCRIPTS || false,
      },
    ]);

  // TODO: remove after dropping support for node@14
  if (configManager.buildType === 'server') {
    config.plugin('node-performance').use(webpack.ProvidePlugin, [
      {
        performance: ['perf_hooks', 'performance'],
      },
    ]);
  }

  return config;
};
