import path from 'path';
import type webpack from 'webpack';
import type Config from 'webpack-chain';
import crypto from 'crypto';
import resolve from 'resolve';

import type { ConfigManager } from '../../../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../../../typings/configEntry/application';

import type { SplitChunksOptions } from '../../../../types/webpack';

// based on [nextjs code](https://github.com/vercel/next.js/blob/aaeb349ce3e8c4c3435a43a29af4379266818e7b/packages/next/build/webpack-config.ts#L707)
export const resolveFrameworksPaths = (rootDir: string, frameworksList: string[]) => {
  const topLevelFrameworkPaths: string[] = [];
  const visitedFrameworkPackages = new Set<string>();

  // Adds package-paths of dependencies recursively
  const addPackagePath = (packageName: string, relativePath: string) => {
    try {
      if (visitedFrameworkPackages.has(packageName)) {
        return;
      }

      visitedFrameworkPackages.add(packageName);

      const packageJsonPath = require.resolve(`${packageName}/package.json`, {
        paths: [relativePath],
      });
      const packageJsonPathPreservedSymlink = resolve.sync(`${packageName}/package.json`, {
        basedir: relativePath,
        preserveSymlinks: true,
      });

      // Include a trailing slash so that a `.startsWith(packagePath)` check avoids false positives
      // when one package name starts with the full name of a different package.
      // For example:
      //   "node_modules/react-slider".startsWith("node_modules/react")  // true
      //   "node_modules/react-slider".startsWith("node_modules/react/") // false
      const directory = path.join(packageJsonPath, '../');
      // For cases when application built with "--resolveSymlinks false" CLI flag or "resolveSymlinks: false" JS API parameter
      const directoryPreservedSymlink = path.join(packageJsonPathPreservedSymlink, '../');

      // Returning from the function in case the directory has already been added and traversed
      if (topLevelFrameworkPaths.includes(directory)) return;
      topLevelFrameworkPaths.push(directory);
      // If symlinks are preserved, we need to get both the real path and symlink path
      if (!topLevelFrameworkPaths.includes(directoryPreservedSymlink)) {
        topLevelFrameworkPaths.push(directoryPreservedSymlink);
      }

      const dependencies = require(packageJsonPath).dependencies || {};

      for (const name of Object.keys(dependencies)) {
        addPackagePath(name, directory);
      }
    } catch (_) {
      // don't error on failing to resolve framework packages
    }
  };

  for (const packageName of frameworksList) {
    addPackagePath(packageName, rootDir);
  }

  return topLevelFrameworkPaths;
};

// eslint-disable-next-line max-statements
export const splitChunksConfig =
  (configManager: ConfigManager<ApplicationConfigEntry>) => (config: Config) => {
    const { rootDir, splitChunks, env } = configManager;

    const topLevelFrameworkPaths = resolveFrameworksPaths(rootDir, ['react', 'react-dom']);

    const reactCacheGroup: Exclude<Required<SplitChunksOptions>, boolean>['cacheGroups'][string] = {
      chunks: 'all',
      name: 'react',
      // This regex ignores nested copies of framework libraries so they're bundled with their issuer.
      // test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
      test(module: webpack.Module) {
        const resource = module.nameForCondition && module.nameForCondition();

        if (!resource) {
          return false;
        }

        return (
          !resource.startsWith('react-refresh') &&
          topLevelFrameworkPaths.some((packagePath) => resource.startsWith(packagePath))
        );
      },
      priority: 40,
      // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
      enforce: true,
    };
    let webpackSplitChunks: SplitChunksOptions = false;

    switch (splitChunks.mode) {
      case 'granularChunks': {
        const shared: any = {
          chunks: 'async',
          minChunks: splitChunks.granularChunksSplitNumber,
          minSize: splitChunks.granularChunksMinSize,
          reuseExistingChunk: true,
          priority: 30,
        };

        // too slow for development, default names is fast, but have one problem -
        // we can find shared chunk filenames only in `chunks` stats property, not in `assetsByChunkName`
        // https://github.com/webpack/webpack/issues/14433#issuecomment-938468513
        if (env === 'production') {
          shared.name = (module: webpack.Module, chunks: webpack.Chunk[] = []) => {
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

        webpackSplitChunks = {
          chunks: 'all',
          maxInitialRequests: 10,
          maxAsyncRequests: 20,
          cacheGroups: {
            default: false,
            defaultVendors: false,
            reactCacheGroup,
            shared,
          },
        };
        break;
      }
      case 'commonChunk': {
        webpackSplitChunks = {
          cacheGroups: {
            default: false,
            defaultVendors: false,
            reactCacheGroup,
            commons: {
              name: 'common-chunk',
              minChunks: splitChunks.commonChunkSplitNumber,
              priority: 30,
            },
          },
        };
        break;
      }
    }

    const { hotRefresh } = configManager;

    if (hotRefresh?.enabled && webpackSplitChunks) {
      webpackSplitChunks.cacheGroups.hmr = {
        name: 'hmr',
        enforce: true,
        test: /[\\/]node_modules[\\/](react-refresh|webpack-hot-middleware|@pmmmwh[\\/]react-refresh-webpack-plugin)[\\/]/,
        chunks: 'all',
        priority: 20,
      };
    }

    config.optimization
      .splitChunks(webpackSplitChunks)
      // namedChunks должно быть включено, чтобы webpack-flush-chunks смог определить имена чанков от которых зависит чанк бандла после обработчки через splitChunks
      .set('chunkIds', 'named');

    return config;
  };
