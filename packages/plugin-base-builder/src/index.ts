import type { Configuration as WebpackConfiguration } from 'webpack';
import { DevtoolOption, Extension } from '@tramvai/api/lib/config';

/**
 * @title Configure the options on webpack splitChunks
 * @default {}
 */
export type SplitChunksConfig = {
  /**
   * @default "granularChunks"
   */
  mode?: 'granularChunks' | false;
  /**
   * @title Move tramvai packages into a separate chunk
   * @default true
   */
  frameworkChunk?: boolean;
  /**
   * @title Move module to shared chunk if used at least as many times in other chunks
   * @default 2
   */
  granularChunksSplitNumber?: number;
  /**
   * @title Minimum shared chunk size in bytes
   * @default 20000
   */
  granularChunksMinSize?: number;
};

interface СonfigOptions {
  /**
   * @title Additional resolve alias setting
   */
  resolveAlias?: Record<string, string | false | string[]>;
  /**
   * @title Browser package resolve fallback. E.g. { "stream": "stream-browserify" }
   * @see https://webpack.js.org/configuration/resolve/#resolvefallback
   */
  resolveFallback?: Record<string, string | false | string[]>;
  /**
   * @title Browser packages to provide with ProvidePlugin. E.g. { "Buffer": ["buffer", "Buffer"] }
   * @see https://webpack.js.org/plugins/provide-plugin/
   */
  provide?: Record<string, string | string[]>;
  /**
   * @title Configure https://webpack.js.org/configuration/watch/#watchoptions
   */
  watchOptions?: WebpackConfiguration['watchOptions'];
  /**
   * @title Use the specified type of source maps for building in development mode
   * @default false
   */
  devtool?: DevtoolOption;
  /**
   * @title The externals configuration option provides a way of excluding dependencies from the output bundles
   * @see https://webpack.js.org/configuration/externals/
   */
  externals?:
    | string[]
    | {
        development?: string[];
        production?: string[];
      };
}

export const configExtension = {
  webpack: ({ project }: Parameters<Extension<any>>[0]): СonfigOptions => {
    return {
      resolveFallback: project.webpack?.resolveFallback ?? {},
      resolveAlias: project.webpack?.resolveAlias ?? {},
      provide: project.webpack?.provide ?? {},
      watchOptions: project.webpack?.watchOptions,
      devtool: project.webpack?.devtool ?? false,
      externals: project.webpack?.externals,
    };
  },
};

export const splitChunksConfigExtension = {
  splitChunks: ({ project }: Parameters<Extension<any>>[0]): SplitChunksConfig | undefined => {
    if (project.type === 'child-app') {
      return undefined;
    }

    const {
      mode = 'granularChunks',
      frameworkChunk = true,
      granularChunksSplitNumber = 2,
      granularChunksMinSize = 20000,
    } = project.splitChunks ?? {};

    return {
      mode,
      frameworkChunk,
      granularChunksSplitNumber,
      granularChunksMinSize,
    } satisfies SplitChunksConfig;
  },
};

/**
 * @see https://webpack.js.org/configuration/optimization/#optimizationruntimechunk
 */
export type RuntimeChunk = 'single' | 'multiple' | boolean;

export const runtimeChunkExtension = {
  runtimeChunk: ({ project }: Parameters<Extension<any>>[0]) => {
    if (project.type === 'child-app') {
      return false;
    }

    return (project.runtimeChunk ?? 'single') satisfies RuntimeChunk;
  },
};

type SplitChunksConfigExtensionType = typeof splitChunksConfigExtension;
type сonfigExtensionType = typeof configExtension;
type RuntimeChunkConfigExtensionType = typeof runtimeChunkExtension;

declare module '@tramvai/api/lib/config' {
  export interface ApplicationProject {
    splitChunks?: SplitChunksConfig;
    webpack?: СonfigOptions;
    runtimeChunk?: RuntimeChunk;
  }

  export interface ChildAppProject {
    webpack?: СonfigOptions;
  }

  export interface ConfigurationExtensions
    extends SplitChunksConfigExtensionType,
      сonfigExtensionType,
      RuntimeChunkConfigExtensionType {}
}
