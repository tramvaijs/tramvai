import path from 'path';
import crypto from 'crypto';
import resolve from 'resolve';
import { Configuration, Module, Chunk, NormalModule } from 'webpack';
import { Configuration as RspackConfiguration } from '@rspack/core';
import type { ConfigService } from '@tramvai/api/lib/config';
import { ModuleFederationSharedObject } from '../types';

export type SplitChunksOptions = Required<Required<Configuration>['optimization']>['splitChunks'];
type CacheGroup = Exclude<Required<SplitChunksOptions>, boolean>['cacheGroups'][string];

const tramvaiScopes = ['@tramvai/', '@tramvai-tinkoff/'];
const tinkoffPackages = [
  '@tinkoff/router',
  '@tinkoff/logger',
  '@tinkoff/dippy',
  '@tinkoff/user-agent',
  '@tinkoff/module-loader-client',
  '@tinkoff/meta-tags-generate',
  '@tinkoff/browser-cookies',
  '@tinkoff/errors',
  '@tinkoff/layout-factory',
  '@tinkoff/url',
  '@tinkoff/roles',
  '@tinkoff/hook-runner',
  '@tinkoff/pubsub',
  '@tinkoff/browser-timings',
];
const tinkoffPackagesSet = new Set(tinkoffPackages);

function isTramvaiPackage(packageName: string | undefined) {
  if (!packageName) return false;

  // exclude from tramvai chunk for virtual modules imports and fixtures in @tramvai/api integration tests
  if (packageName.startsWith('@tramvai/api')) {
    return;
  }

  return (
    tramvaiScopes.some((scope) => packageName.startsWith(scope)) ||
    tinkoffPackagesSet.has(packageName)
  );
}

function normalizePath(packagePath: string) {
  return packagePath.endsWith('/') ? packagePath : `${packagePath}/`;
}

const tramvaiPackagesPaths = [...tramvaiScopes, ...tinkoffPackages].map((packageName) =>
  normalizePath(`/node_modules/${packageName}`)
);

function isTramvaiResource(resource: string | undefined) {
  if (!resource) return false;

  return tramvaiPackagesPaths.some((tramvaiPackagePath) => resource.includes(tramvaiPackagePath));
}

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

type OptimizationMap = {
  webpack: Configuration['optimization'];
  rspack: RspackConfiguration['optimization'];
};

// eslint-disable-next-line max-statements
export const createSplitChunksOptions = <T extends keyof OptimizationMap>({
  config,
  builder,
}: {
  config: ConfigService;
  builder: T;
}) => {
  const splitChunks = config.extensions.splitChunks()!;

  const topLevelFrameworkPaths = resolveFrameworksPaths(config.rootDir, ['react', 'react-dom']);

  const reactCacheGroup: CacheGroup = {
    chunks: 'all',
    name: 'react',
    // This regex ignores nested copies of framework libraries so they're bundled with their issuer.
    // test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
    test(module: Module) {
      const resource = module.nameForCondition?.();

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

  const tramvaiCacheGroup: CacheGroup = splitChunks.frameworkChunk
    ? {
        chunks: 'initial',
        name: 'tramvai',
        test(module: Module) {
          const resource = module.nameForCondition?.();
          const packageName = (module as NormalModule).resourceResolveData?.descriptionFileData
            ?.name as string | undefined;

          return isTramvaiPackage(packageName) || isTramvaiResource(resource ?? undefined);
        },
        priority: 35,
        // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
        enforce: true,
      }
    : false;

  let webpackSplitChunks: SplitChunksOptions = false;

  if (splitChunks.mode === 'granularChunks') {
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
    if (config.mode === 'production') {
      shared.name = (module: Module, chunks: Chunk[] = []) => {
        return crypto
          .createHash('sha1')
          .update(
            chunks.reduce((acc: string, chunk: Chunk) => {
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
        tramvaiCacheGroup,
        shared,
      },
    };
  }

  if (config.hotRefresh?.enabled && webpackSplitChunks) {
    const hmrRegExp =
      builder === 'webpack'
        ? /[\\/]node_modules[\\/](react-refresh|webpack-hot-middleware|webpack[\\/]hot|webpack-dev-server|@pmmmwh[\\/]react-refresh-webpack-plugin)[\\/]/
        : /[\\/]node_modules[\\/](react-refresh|@rspack[\\/]plugin-react-refresh|webpack-dev-server|webpack[\\/]hot|@rspack[\\/]core[\\/]hot|@rspack[\\/]hot|@rspack[\\/]dev-server)[\\/]/;
    webpackSplitChunks.cacheGroups!.hmr = {
      name: 'hmr',
      enforce: true,
      test: hmrRegExp,
      chunks: 'all',
      priority: 20,
    };
  }

  return {
    splitChunks: webpackSplitChunks,
    // namedChunks must be enabled so that webpack-flush-chunks can determine the names of the chunks that the chunk bundle depends on after being processed through SplitChunks
    chunkIds: 'named',
  } as OptimizationMap[T];
};

export const createChildAppSplitChunksOptions = <T extends keyof OptimizationMap>({
  config,
  target,
  sharedModules,
}: {
  config: ConfigService;
  target: 'client' | 'server';
  sharedModules: ModuleFederationSharedObject;
}) => {
  const sharedModulesPaths = resolveFrameworksPaths(config.rootDir, Object.keys(sharedModules));

  const webpackSplitChunks: SplitChunksOptions = {
    cacheGroups: {
      default: false,
      defaultVendors: false,
      styles: {
        name: config.projectName,
        type: 'css/mini-extract',
        chunks: 'async',
        enforce: true,
        priority: 50,
      },
    },
  };

  if (target === 'client') {
    const granular: Record<string, any> = {
      // we don't want to include MF shared deps
      test(mod: Module) {
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

    webpackSplitChunks.cacheGroups!.granular = granular;
  }

  return {
    splitChunks: webpackSplitChunks,
    chunkIds: 'named',
  } as OptimizationMap[T];
};
