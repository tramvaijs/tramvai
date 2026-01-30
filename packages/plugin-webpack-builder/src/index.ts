import { declareModule, provide } from '@tinkoff/dippy';
import type { Configuration as WebpackConfiguration } from 'webpack';
import {
  DEV_SERVER_TOKEN,
  PORT_MANAGER_TOKEN,
  TRACER_TOKEN,
  DEV_SERVER_CLOSE_HANDLER_TOKEN,
} from '@tramvai/api/lib/tokens';
import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  DevtoolOption,
  Extension,
  INPUT_PARAMETERS_TOKEN,
} from '@tramvai/api/lib/config';
import { createDevServer } from './dev-server/dev-server';

export { PolyfillConditionPlugin } from './webpack/plugins/polyfill-condition-plugin';
export { AssetsIntegritiesPlugin } from './webpack/plugins/AssetsIntegritiesPlugin';
export { PatchAutoPublicPathPlugin } from './webpack/plugins/AutoPublicPathPlugin';
export { RuntimePathPlugin } from './webpack/plugins/RuntimePathPlugin';
export {
  ModuleFederationFixRange,
  ModuleFederationFixRangeOptions,
} from './webpack/plugins/ModuleFederationFixRange';
export {
  ModuleFederationIgnoreEntries,
  ModuleFederationIgnoreEntriesOptions,
} from './webpack/plugins/ModuleFederationIgnoreEntries';
export { PurifyStatsPlugin } from './webpack/plugins/PurifyStatsPlugin';
export { BUILD_TYPE_TOKEN, BUILD_MODE_TOKEN, BUILD_TARGET_TOKEN } from './webpack/webpack-config';
export {
  WEBPACK_TRANSPILER_TOKEN,
  WebpackTranspiler,
  WebpackTranspilerInputParameters,
} from './webpack/shared/transpiler';
export { DEFINE_PLUGIN_OPTIONS_TOKEN } from './webpack/shared/define';
export { WEBPACK_EXTERNALS_TOKEN } from './webpack/shared/externals';
export { RESOLVE_EXTENSIONS_TOKEN } from './webpack/shared/resolve';
export { WEBPACK_PLUGINS_TOKEN } from './webpack/shared/plugins';
export { getBenchmarkRsdoctorOptions } from './webpack/shared/rsdoctor';

export { calculateBuildTime } from './utils/calculateBuildTime';
export { maxMemoryRss } from './utils/maxMemoryRss';

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

interface WebpackConfigOptions {
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

const webpackConfigExtension = {
  webpack: ({ project }: Parameters<Extension<any>>[0]): WebpackConfigOptions => {
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

const splitChunksConfigExtension = {
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

const runtimeChunkExtension = {
  runtimeChunk: ({ project }: Parameters<Extension<any>>[0]) => {
    if (project.type === 'child-app') {
      return false;
    }

    return (project.runtimeChunk ?? 'single') satisfies RuntimeChunk;
  },
};

type SplitChunksConfigExtensionType = typeof splitChunksConfigExtension;
type WebpackConfigExtensionType = typeof webpackConfigExtension;
type RuntimeChunkConfigExtensionType = typeof runtimeChunkExtension;

declare module '@tramvai/api/lib/config' {
  export interface ApplicationProject {
    splitChunks?: SplitChunksConfig;
    webpack?: WebpackConfigOptions;
    runtimeChunk?: RuntimeChunk;
  }

  export interface ChildAppProject {
    webpack?: WebpackConfigOptions;
  }

  export interface ConfigurationExtensions
    extends SplitChunksConfigExtensionType,
      WebpackConfigExtensionType,
      RuntimeChunkConfigExtensionType {}
}

export const WebpackBuilderPlugin = declareModule({
  name: 'WebpackBuilderPlugin',
  providers: [
    provide({
      provide: DEV_SERVER_TOKEN,
      useFactory: createDevServer,
      deps: {
        inputParameters: INPUT_PARAMETERS_TOKEN,
        portManager: PORT_MANAGER_TOKEN,
        config: CONFIG_SERVICE_TOKEN,
        tracer: TRACER_TOKEN,
        closeHandlers: DEV_SERVER_CLOSE_HANDLER_TOKEN,
      },
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: splitChunksConfigExtension,
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: webpackConfigExtension,
    }),
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: runtimeChunkExtension,
    }),
  ],
});

// eslint-disable-next-line import/no-default-export
export default WebpackBuilderPlugin;
