import type Config from 'webpack-chain';
import type webpack from 'webpack';
import path from 'path';
import crypto from 'crypto';

import { UniversalFederationPlugin } from '@module-federation/node';
import {
  ModuleFederationFixRange,
  ModuleFederationFixRangeOptions,
  PatchAutoPublicPathPlugin,
} from '@tramvai/plugin-webpack-builder';

import common from '../common/main';
import type { ConfigManager } from '../../../config/configManager';
import ts from '../blocks/ts';
import js from '../blocks/js';
import css from '../blocks/css';
import nodeClient from '../blocks/nodeClient';
import type { SplitChunksOptions, UniversalFederationPluginOptions } from '../types/webpack';
import { getSharedModules } from './moduleFederationShared';
import { configToEnv } from '../blocks/configToEnv';
import type { ChildAppConfigEntry } from '../../../typings/configEntry/child-app';
import { extractCssPluginFactory } from '../blocks/extractCssPlugin';
import { resolveFrameworksPaths } from '../application/client/prod/optimization/splitChunks';

// eslint-disable-next-line max-statements
export default (configManager: ConfigManager<ChildAppConfigEntry>) => (config: Config) => {
  const { name, root, rootDir, buildType, shared, env, target } = configManager;

  const cssLocalIdentName =
    configManager.env === 'production'
      ? `${name}__[minicss]`
      : `${name}__[name]__[local]_[hash:base64:5]`;
  const entry = path.resolve(configManager.rootDir, root, 'index.ts');

  const sharedModules = getSharedModules(configManager);

  // use empty module instead of original one as I haven't figured out how to prevent webpack from initializing entry module on loading
  // it should be initialized only as remote in ModuleFederation and not as standalone module
  config.entry(name).add(path.resolve(__dirname, 'fakeModule.js?fallback'));

  config.batch(nodeClient(configManager));

  config.batch(common(configManager));

  config.batch(configToEnv(configManager));

  config
    .batch(js(configManager))
    .batch(ts(configManager))
    .batch(
      css(configManager, {
        localIdentName: cssLocalIdentName,
      })
    );

  config.batch(
    extractCssPluginFactory(configManager, {
      filename: `[name]@${configManager.version}.css`,
      chunkFilename: `[name]@${configManager.version}.css`,
    })
  );

  config.optimization.set('chunkIds', 'named');

  // define split chunks to put all of the css into single entry file
  const webpackSplitChunks: SplitChunksOptions = {
    cacheGroups: {
      default: false,
      defaultVendors: false,
      styles: {
        name,
        type: 'css/mini-extract',
        chunks: 'async',
        enforce: true,
        priority: 50,
      },
    },
  };

  // granular code splitting only for client builds
  if (target !== 'node') {
    // get resolved paths for shared modules and their dependencies
    const sharedModulesPaths = resolveFrameworksPaths(
      path.resolve(rootDir, root),
      Object.keys(sharedModules)
    );

    const granular: Record<string, any> = {
      // we don't want to include MF shared deps
      test(mod: webpack.Module) {
        const resource = mod.nameForCondition && mod.nameForCondition();

        if (!resource) {
          return false;
        }

        return sharedModulesPaths.every((packagePath) => !resource.startsWith(packagePath));
      },
      chunks: 'async',
      // in some cases this group has priority over styles group, idk why, so decide to specify modules type explicitly
      type: 'javascript/auto',
      minChunks: 2,
      minSize: 20000,
      reuseExistingChunk: true,
      maxInitialRequests: 10,
      maxAsyncRequests: 20,
      priority: 20,
    };

    // too slow for development, default names is fast, but have one problem -
    // we can find shared chunk filenames only in `chunks` stats property, not in `assetsByChunkName`
    // https://github.com/webpack/webpack/issues/14433#issuecomment-938468513
    if (env === 'production') {
      granular.name = (module: webpack.Module, chunks: webpack.Chunk[] = []) => {
        return crypto
          .createHash('sha1')
          .update(
            chunks.reduce((acc: string, chunk: webpack.Chunk) => {
              return acc + chunk.name;
            }, '')
          )
          .digest('hex')
          .substring(0, 16);
      };
    }

    webpackSplitChunks.cacheGroups.granular = granular;
  }

  config.optimization.splitChunks(webpackSplitChunks);

  config.plugin('module-federation').use(UniversalFederationPlugin, [
    {
      isServer: buildType === 'server',
      name,
      library:
        configManager.buildType === 'server'
          ? {
              type: 'commonjs2',
            }
          : {
              name: 'window["child-app__" + (document.currentScript.src || document.currentScript.dataset.src)]',
              type: 'assign',
            },
      exposes: {
        // path.relative should use the posix separator because
        // @module-federation/node is parsing relative path incorrectly
        // Debug notes: there is problem in webpack/ModuleFederation or enhanced-resolve
        entry: entry.split(path.win32.sep).join(path.posix.sep),
      },
      shared: sharedModules,
    } as UniversalFederationPluginOptions,
  ]);

  config.plugin('patch-auto-public-path').use(PatchAutoPublicPathPlugin);

  config.plugin('module-federation-validate-duplicates').use(ModuleFederationFixRange, [
    {
      flexibleTramvaiVersions: shared.flexibleTramvaiVersions,
    } as ModuleFederationFixRangeOptions,
  ]);
};
