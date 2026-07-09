import fs from 'node:fs';

import type { Config as SvgoConfig } from 'svgo';
import type { JpegOptions, PngOptions, GifOptions, WebpOptions, AvifOptions } from 'sharp';
import type { SubresourceIntegrityPluginOptions } from 'webpack-subresource-integrity';
import type { ReactRefreshPlugin } from '@pmmmwh/react-refresh-webpack-plugin';
import type { DeduplicateStrategy } from '@tinkoff/webpack-dedupe-plugin';
import type { PluginOptions } from 'image-minimizer-webpack-plugin';

import { cosmiconfig } from 'cosmiconfig';
import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import { createToken } from '@tinkoff/dippy';

import type { TramvaiPlugin } from '../core/plugin';
import { typescriptLoader } from './config-loader';
import { resolveAbsolutePathForFile } from '../utils/path';
import { packageVersion } from '../utils/package-version';
import { logger } from '../services/logger';

export interface SharpEncodeOptions {
  encodeOptions?: {
    jpeg?: JpegOptions;
    png?: PngOptions;
    gif?: GifOptions;
    webp?: WebpOptions;
    avif?: AvifOptions;
  };
}

/**
 * @see https://github.com/waysact/webpack-subresource-integrity/tree/main/webpack-subresource-integrity#options
 */
export interface IntegrityOptions {
  enabled: boolean | 'auto';
  hashFuncNames: ('sha256' | 'sha384' | 'sha512')[];
  hashLoading: 'eager' | 'lazy';
}

export type PostcssOptions = {
  /**
   * @title Path to postcss config file. By default, `postcss.config.js` file is used
   */
  config?: string;
  /**
   * @title CSS identifiers build algorithm
   */
  cssLocalIdentName?:
    | string
    | {
        development?: string;
        production?: string;
      };
  /**
   * @title Enable CSS modules for all files matching /RegExp/i.test(filename) regexp.
   */
  cssModulePattern?: string;
  // TODO: do we really need it?
  /**
   * @title Path to postcss config file for assets
   */
  assetsConfig?: string;
};

/**
 * @title File-System Routing feature
 */
export type FileSystemPagesOptions = {
  /**
   * @title Read pages from file system
   * @default false
   */
  enabled?: boolean;
  /**
   * @title Folder with pages from which static routers are generated
   * @default "routes"
   */
  routesDir?: string | false;
  /**
   * @title Folder with components which can be manually added to static routers
   * @default "pages"
   */
  pagesDir?: string | false;
  /**
   * @title Test Regexp to add only files with specific name to list of FS Components
   */
  componentsPattern?: string;
  /**
   * @title Path to RootErrorBoundary component (relative to "root" directory)
   * @default "error.tsx"
   */
  rootErrorBoundaryPath?: string;
};

export type HotRefreshOptions = {
  /**
   * @title Enable react hot-refresh
   * @default true
   */
  enabled?: boolean;
  /**
   * @title Configure react hot-refresh https://github.com/pmmmwh/react-refresh-webpack-plugin#options
   * @default {}
   */
  options?: ConstructorParameters<typeof ReactRefreshPlugin>[0];
};

export type DevtoolOption =
  | false
  | 'eval'
  | 'eval-cheap-source-map'
  | 'eval-cheap-module-source-map'
  | 'eval-source-map'
  | 'cheap-source-map'
  | 'cheap-module-source-map'
  | 'source-map'
  | 'inline-cheap-source-map'
  | 'inline-cheap-module-source-map'
  | 'inline-source-map'
  | 'eval-nosources-cheap-source-map'
  | 'eval-nosources-cheap-module-source-map'
  | 'eval-nosources-source-map'
  | 'inline-nosources-cheap-source-map'
  | 'inline-nosources-cheap-module-source-map'
  | 'inline-nosources-source-map'
  | 'nosources-cheap-source-map'
  | 'nosources-cheap-module-source-map';

export type ReactCompilerOptions = {
  /*
   * @title Array of paths which React compiler applies to. Ignore node_moduled by default
   */
  sources?: Array<string>;
  /*
   * @title Determines the strategy for determining which functions to compile
   */
  compilationMode?: 'infer' | 'annotation' | 'all';
  /**
   * @title Determines the point at which compiler should throw an error
   */
  panicThreshold?: 'ALL_ERRORS' | 'CRITICAL_ERRORS' | 'NONE';
};

export type ApplicationExperiments = {
  /**
   * @title Enable View Transitions API for SPA navigations
   * @default false
   */
  viewTransitions?: boolean;
  /**
   * @title Enable React Transitions for SPA navigations
   * @default false
   */
  reactTransitions?: boolean;
  /**
   * @title Enable Lightningcss for css transpiling as Postcss alternative
   * @default false
   */
  lightningcss?: boolean;
  /**
   * https://github.com/facebook/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/Entrypoint/Options.ts
   *
   * @title Enable React Compiler. You can pass some options, or use it with meaningful defaults.
   * @default false
   */
  reactCompiler?: boolean | ReactCompilerOptions;
};

export type TranspilationOptions = {
  /**
   * @title customize transpiling of node_modules in prod/dev environments
   */
  include?: {
    development?: 'all' | 'only-modern' | 'none' | string[];
    production?: 'all' | 'only-modern';
  };
};

/**
 * @title Enable DedupePlugin
 * @default {}
 */
export type DedupeOptions = {
  /**
   * @title Strategy for DedupePlugin
   * @default true
   */
  enabled: boolean;
  /**
   * @title Does DedupePlugin should be enabled in development mode
   * Why it might be useful see [issue](https://github.com/Tinkoff/tramvai/issues/11)
   * @default false
   */
  enabledDev: boolean;
  /**
   * @title Strategy for DedupePlugin
   * @default "equality"
   */
  strategy: DeduplicateStrategy;
  /**
   * @title Sets ignore to DedupePlugin
   */
  ignore?: string[];
};

/**
 * @description Serializable parameters from CLI arguments or JS API parameters
 */
export type InputParameters = {
  name: string;
  mode?: 'development' | 'production';
  port?: number;
  host?: string;
  httpsKey?: string;
  httpsCert?: string;
  benchmark?: boolean;
  runtimeEnv?: Record<string, string>;
  sourceMap?: boolean;
  analyze?: false | 'bundle' | 'whybundled' | 'statoscope' | 'rsdoctor' | 'stats';
  staticPort?: number;
  staticHost?: string;
  https?: boolean;
  rootDir?: string;
  /**
   * @description Resolve symbolic links to real paths
   * @default true
   */
  resolveSymlinks?: boolean;
  /**
   * @description Build all, or only client or server builds (usually used for performance reasons)
   * @default "all"
   */
  buildType?: 'client' | 'server' | 'all';
  /**
   * @description Stop watching for changes for server and client builds
   * @default false
   */
  noRebuild?: boolean;
  /**
   * @description Stop watching for changes for server build
   * @default false
   */
  noServerRebuild?: boolean;
  /**
   * @description Stop watching for changes for client build
   * @default false
   */
  noClientRebuild?: boolean;
  /**
   * @description Debug server.js process
   * @default false
   */
  debug?: string | false;
  /**
   * @description Debug build process
   * @default false
   */
  debugBuild?: string | false;
  /**
   * @description Verbose build logging
   * @default false
   */
  verboseLogging?: boolean;
  /**
   * @description Show progressbar of build process
   * @default false
   */
  showProgress?: boolean;
  /**
   * @description Show banner with tips for build process
   * @default false
   */
  showBanner?: boolean;
  /**
   * Enables cache for build
   * @default true
   */
  fileCache?: boolean;
  /**
   * Enables cache profiling
   * @default false
   */
  cacheProfile?: boolean;
  /**
   * Disable server runner start waiting, used for test purposes
   * @default false
   */
  disableServerRunnerWaiting?: boolean;
  /**
   * Disable websocket server and additional entry, used for test purposes
   * @default false
   */
  disableWebSocketServer?: boolean;
  /**
   * Enable experimental server hot reload
   * @default false
   */
  serverHot?: boolean;
};

export type Project = ApplicationProject | ChildAppProject;
export interface BaseProject {
  /**
   * [svgo](https://github.com/svg/svgo) configuration, used for SVG and [SVGR](https://react-svgr.com/) optimization
   */
  svgo?: SvgoConfig;

  /**
   * Enables data-qa-tag plugin for transpiler
   * @default false
   */
  generateDataQaTag?: boolean;

  /**
   * @title Enable babel plugin `fill-declare-action-name` (not supported with swc transpiler)
   * @default false
   */
  enableFillDeclareActionNamePlugin?: boolean;

  transpilation?: TranspilationOptions;

  /**
   * React hot-refresh options
   */
  hotRefresh?: HotRefreshOptions;

  /**
   * Live reload after build in browser
   */
  liveReload?: boolean;

  /**
   * @title Configure webpack dev server writeToDisk option
   * @default false
   */
  writeToDisk?: boolean;

  /**
   * Image optimization options
   */
  imageOptimization?: {
    /**
     * Enable image-minimizer-webpack-plugin
     */
    enabled?: boolean;
    /**
     * Options to image-minimizer-webpack-plugin
     */
    options?: PluginOptions<any, any>;
  };

  /**
   * @title Enable source maps for client and server builds
   * @default { development: false, production: true }
   */
  sourceMap?:
    | boolean
    | {
        development:
          | boolean
          | {
              client: boolean;
              server: boolean;
            };
        production:
          | boolean
          | {
              client: boolean;
              server: boolean;
            };
      };

  /**
   * @title backwards compatibility for `*.less` files processing
   * @deprecated prefer CSS Modules and PostCSS usage, this option will be removed in future releases
   * @default false
   */
  deprecatedLessSupport?: boolean;

  /**
   * @title Specify dependencies that will be shared between application and child-apps
   * @description Properly defining that dependencies may greatly reduce filesize of loaded js on the client
   * @default {}
   */
  shared?: {
    /**
     * @title Should default dependencies list be added to shared list
     * @description It includes the list of commonly used dependencies in the child-apps
     * By default, it is enabled in application in case of tramvai/module-child-app is specified in package.json
     * and for child-apps
     */
    defaultTramvaiDependencies?: boolean;
    /**
     * @title automatically resolve requiredVersion for shared dependencies
     * @see https://webpack.js.org/plugins/module-federation-plugin/#requiredversion
     * @default true
     */
    autoResolveSharedRequiredVersions?: boolean;
    /**
     * @title add chunks to preload as critical in-parallel with "platform.js"
     * @description this option is useful when you need to create async boundary for app dependencies.
     * More info - https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption
     * @default []
     */
    criticalChunks?: string[];
    /**
     * @title list of the dependencies that will be shared
     * @default []
     */
    deps?: Array<
      | string
      | {
          /**
           * @title name of the dependency import
           */
          name: string;
          /**
           * @title if dependency is marked as singleton the dependency will be initialized only once and will not be updated
           * @description Do not overuse that feature as it may lead to subtle bugs in case of different versions on different sides
           * @default false
           */
          singleton: boolean;
        }
    >;
  };
}

export interface ApplicationProject extends BaseProject {
  name: string;
  type: 'application';
  /**
   * @title Path to the root directory, where `tramvai.config.ts` is located
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * @title Path to the project source code directory, relative to `rootDir`
   * @default "src"
   */
  sourceDir?: string;
  /**
   * @title Path to the project entry point, relative to `rootDir` + `sourceDir`
   * If absolute path is provided, it will be used as is
   * @default "index.ts"
   */
  entryFile?: string;
  output?: {
    server?: string;
    client?: string;
    static?: string;
  };
  fileSystemPages?: FileSystemPagesOptions;
  /**
   * @title File-System Papi Routes source directory
   * @default "api"
   */
  fileSystemPapiDir?: string;
  experiments?: ApplicationExperiments;
  postcss?: PostcssOptions;
  polyfill?: string;
  modernPolyfill?: string;
  dedupe?: DedupeOptions;
  integrity?: IntegrityOptions | boolean;
}

export interface ChildAppProject extends BaseProject {
  name: string;
  type: 'child-app';
  /**
   * @title Path to the root directory, where `tramvai.config.ts` is located
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * @title Path to the project source code directory, relative to `rootDir`
   * If absolute path is provided, it will be used as is
   * @default "src"
   */
  sourceDir?: string;
  /**
   * @title Path to the project entry point, relative to `rootDir` + `sourceDir`
   * If absolute path is provided, it will be used as is
   * @default "index.ts"
   */
  entryFile?: string;
  output?: string;
  dedupe?: DedupeOptions;
}

export type Configuration = {
  projects: Record<string, Project>;
  plugins?: Array<TramvaiPlugin | string>;
};

export type SerializableConfig = {
  projectType: string;
  projectName: string;
  staticPort: number;
  staticHost: string;
  port: number;
  host: string;
  httpProtocol: string;
  assetsPrefix: string | null;
  output: {
    server: string;
    client: string;
    static: string;
  };
};

export type Extension<Value> = ({
  config,
  parameters,
  project,
}: {
  config: ConfigService;
  parameters: InputParameters;
  project: Project;
}) => Value;

type ExtensionToken = Record<string, Extension<any>>;

export interface ConfigurationExtensions {}

export const CONFIG_SERVICE_TOKEN = createToken<ConfigService>('tramvai config service');

export const INPUT_PARAMETERS_TOKEN = createToken<InputParameters>('tramvai input parameters');

export const CONFIGURATION_EXTENSION_TOKEN = createToken<ExtensionToken>(
  'tramvai configuration extension',
  {
    multi: true,
  }
);

// TODO: как выделить типы для приложения или Child App'а?
// фабрика отдельной сущности AppProject / ChildAppProject?
export class ConfigService {
  #parameters: InputParameters;
  #config!: Configuration;
  #extraConfig: Partial<Configuration>;
  #project!: Project;
  #configPath: string | null = null;
  #extensions: ExtensionToken[] = [];
  #resolvedExtensions:
    | {
        [key in keyof ConfigurationExtensions]: () => ReturnType<ConfigurationExtensions[key]>;
      }
    | null = null;

  constructor(parameters: InputParameters, extraConfiguration?: Partial<Configuration>) {
    this.#parameters = parameters;
    this.#extraConfig = extraConfiguration ?? {};
  }

  async initialize() {
    const config = await this.readConfigurationFile({ rootDir: this.rootDir });

    this.#config = {
      plugins: [...config.plugins, ...(this.#extraConfig.plugins ?? [])],
      projects: mergeDeep(config.projects, this.#extraConfig.projects ?? {}),
    };
    this.#project = this.#config!.projects[this.#parameters.name];

    if (!this.#project) {
      throw new Error(
        `Project ${
          this.#parameters.name
        } not found in configuration file, existing projects: ${Object.keys(
          this.#config!.projects
        )}`
      );
    }
  }

  loadExtensions(extensions: ExtensionToken[]) {
    this.#extensions = extensions;
    this.#resolvedExtensions = null;
  }

  get extensions(): {
    [key in keyof ConfigurationExtensions]: () => ReturnType<ConfigurationExtensions[key]>;
  } {
    if (this.#resolvedExtensions) {
      return this.#resolvedExtensions;
    }

    this.#resolvedExtensions = this.#extensions.reduce((extensions, currentExtension) => {
      for (const key in currentExtension) {
        extensions[key] = () =>
          currentExtension[key]({
            config: this,
            parameters: this.#parameters,
            project: this.#project,
          });
      }
      return extensions;
    }, {});

    return this.#resolvedExtensions;
  }

  get rawConfiguration() {
    return this.#config;
  }

  get extraConfiguration() {
    return this.#extraConfig;
  }

  get configPath() {
    return this.#configPath;
  }

  get plugins() {
    return this.#config?.plugins ?? [];
  }

  get buildType() {
    return this.#parameters?.buildType ?? 'all';
  }

  get noServerRebuild() {
    return this.#parameters?.noServerRebuild ?? this.#parameters?.noRebuild ?? false;
  }

  get noClientRebuild() {
    return this.#parameters?.noClientRebuild ?? this.#parameters?.noRebuild ?? false;
  }

  get staticPort() {
    return this.#parameters?.staticPort ?? 4000;
  }

  get port() {
    return this.#parameters.port ?? 3000;
  }

  get runtimeEnv() {
    return this.#parameters.runtimeEnv ?? {};
  }

  get staticHost() {
    return this.#parameters?.staticHost ?? 'localhost';
  }

  get host() {
    return this.#parameters?.host ?? 'localhost';
  }

  get benchmark() {
    return this.#parameters?.benchmark ?? false;
  }

  get analyze() {
    return this.#parameters.analyze ?? false;
  }

  get httpProtocol() {
    return this.#parameters?.https ? 'https' : 'http';
  }

  get rootDir() {
    return this.#parameters.rootDir ?? process.cwd();
  }

  get resolveSymlinks() {
    // TODO: slower build with resolveSymlinks because a lot of watched files
    return this.#parameters.resolveSymlinks ?? true;
  }

  get debug() {
    return process.env.TRAMVAI_DEBUG
      ? process.env.TRAMVAI_DEBUG
      : (this.#parameters.debug ?? false);
  }

  get serverHot() {
    return this.#parameters.serverHot;
  }

  get debugBuild() {
    return process.env.TRAMVAI_DEBUG_BUILD
      ? process.env.TRAMVAI_DEBUG_BUILD
      : (this.#parameters.debugBuild ?? false);
  }

  get verboseLogging() {
    return this.#parameters.verboseLogging ?? false;
  }

  get sourceDir() {
    return this.#project.sourceDir ?? 'src';
  }

  get entryFile() {
    return this.#project.entryFile ?? 'index';
  }

  get showProgress() {
    return this.#parameters.showProgress ?? false;
  }

  get showBanner() {
    return this.#parameters.showBanner ?? false;
  }

  get mode() {
    return this.#parameters.mode ?? 'development';
  }

  get projectName() {
    return this.#project.name;
  }

  get projectVersion() {
    return (
      packageVersion({ mode: this.mode, sourceDir: this.sourceDir, rootDir: this.rootDir }) ||
      'unknown'
    );
  }

  get projectType() {
    return this.#project.type;
  }

  get assetsPrefix() {
    if (this.#project!.type === 'child-app') {
      return null;
    }

    return process.env.ASSETS_PREFIX && process.env.ASSETS_PREFIX !== 'static'
      ? process.env.ASSETS_PREFIX
      : `${this.httpProtocol}://${this.staticHost}:${
          this.staticPort
        }/${this.outputClient.replace(/\/$/, '')}/`;
  }

  get polyfill() {
    if (this.#project.type === 'child-app') {
      return null;
    }

    return this.#project.polyfill;
  }

  get modernPolyfill() {
    if (this.#project.type === 'child-app') {
      return null;
    }

    return this.#project.modernPolyfill;
  }

  get outputServer() {
    if (this.#project.type === 'child-app') {
      return this.#project.output ?? 'dist/child-app';
    }
    return this.#project.output?.server ?? 'dist/server';
  }

  get outputServerFilename() {
    return 'server.js';
  }

  get outputClient() {
    if (this.#project.type === 'child-app') {
      return this.#project.output ?? 'dist/child-app';
    }
    return this.#project.output?.client ?? 'dist/client';
  }

  get outputStatic() {
    if (this.#project.type === 'child-app') {
      return this.#project.output ?? 'dist/child-app';
    }
    return this.#project.output?.static ?? 'dist/static';
  }

  get fileSystemPages(): FileSystemPagesOptions | null {
    if (this.#project.type === 'child-app') {
      return null;
    }
    const fileSystemPages = this.#project.fileSystemPages ?? ({} as FileSystemPagesOptions);

    const rootErrorBoundaryPath = resolveAbsolutePathForFile({
      rootDir: this.rootDir,
      sourceDir: this.sourceDir,
      file: fileSystemPages.rootErrorBoundaryPath ?? 'error.tsx',
    });

    return {
      enabled: fileSystemPages.enabled ?? false,
      routesDir: fileSystemPages.routesDir ?? 'routes',
      pagesDir: fileSystemPages.pagesDir ?? 'pages',
      componentsPattern: fileSystemPages.componentsPattern ?? undefined,
      rootErrorBoundaryPath: fs.existsSync(rootErrorBoundaryPath)
        ? rootErrorBoundaryPath
        : undefined,
    };
  }

  get fileSystemPapiDir(): string | null {
    if (this.#project!.type === 'child-app') {
      return null;
    }
    return this.#project!.fileSystemPapiDir ?? 'api';
  }

  get postcss(): PostcssOptions | null {
    if (this.#project.type === 'child-app') {
      return null;
    }
    return this.#project.postcss ?? {};
  }

  get experiments(): ApplicationExperiments {
    if (this.#project.type === 'child-app') {
      return {};
    }

    const experiments = this.#project.experiments ?? {};
    return {
      reactCompiler: experiments.reactCompiler ?? false,
      viewTransitions: experiments.viewTransitions ?? false,
      reactTransitions: experiments.reactTransitions ?? false,
      lightningcss: experiments.lightningcss ?? false,
    };
  }

  get dedupe(): DedupeOptions {
    const {
      enabled = true,
      enabledDev = false,
      strategy = 'equality',
      ignore,
    } = this.#project.dedupe ?? {};

    return { enabled, enabledDev, strategy, ignore };
  }

  get svgo(): BaseProject['svgo'] {
    return this.#project.svgo ?? {};
  }

  get integrity() {
    if (this.#project.type === 'child-app') {
      return null;
    }

    if (this.#project.integrity === true) {
      return {};
    }

    return this.#project.integrity ?? false;
  }

  get clientSourceMap(): boolean {
    return this.getSourceMap('client');
  }

  get serverSourceMap(): boolean {
    return this.getSourceMap('server');
  }

  get hotRefresh(): BaseProject['hotRefresh'] {
    return {
      enabled: this.#project.hotRefresh?.enabled ?? true,
      options: {
        overlay: false,
        ...this.#project.hotRefresh?.options,
      },
    };
  }

  get liveReload(): BaseProject['liveReload'] {
    return this.#project.liveReload ?? true;
  }

  get writeToDisk(): BaseProject['writeToDisk'] {
    return this.#project.writeToDisk ?? false;
  }

  get imageOptimization() {
    return this.#project.imageOptimization ?? {};
  }

  get generateDataQaTag() {
    return this.#project.generateDataQaTag ?? false;
  }

  get enableFillDeclareActionNamePlugin() {
    return this.#project.enableFillDeclareActionNamePlugin ?? false;
  }

  get transpilation() {
    return {
      include: {
        development: this.#project.transpilation?.include?.development ?? 'only-modern',
        production: this.#project.transpilation?.include?.production ?? 'only-modern',
      },
    };
  }

  get fileCache() {
    return this.#parameters.fileCache ?? !process.env.CI;
  }

  get cacheProfile() {
    return this.#parameters.cacheProfile ?? false;
  }

  get disableServerRunnerWaiting() {
    if (this.#project.type === 'application') {
      return this.#parameters.disableServerRunnerWaiting ?? false;
    }

    return false;
  }

  get disableWebSocketServer() {
    if (this.#project.type === 'application') {
      return this.#parameters.disableWebSocketServer ?? false;
    }

    return false;
  }

  get deprecatedLessSupport() {
    return this.#project.deprecatedLessSupport ?? false;
  }

  get shared(): BaseProject['shared'] {
    const configShared = this.#project.shared;

    return {
      defaultTramvaiDependencies: configShared?.defaultTramvaiDependencies,
      criticalChunks: configShared?.criticalChunks ?? [],
      autoResolveSharedRequiredVersions: configShared?.autoResolveSharedRequiredVersions ?? true,
      deps: configShared?.deps ?? [],
    };
  }

  get buildPath() {
    if (this.#project.type === 'child-app') {
      return resolveAbsolutePathForFile({
        rootDir: this.rootDir,
        sourceDir: this.sourceDir,
        file: this.#project.output!,
      });
    }

    return resolveAbsolutePathForFile({
      rootDir: this.rootDir,
      sourceDir: this.sourceDir,
      file: this.buildType === 'server' ? this.outputServer : this.outputClient,
    });
  }

  private getSourceMap(buildType: 'client' | 'server') {
    if (this.#parameters.sourceMap) {
      return this.#parameters.sourceMap;
    }

    if (typeof this.#project.sourceMap === 'boolean') {
      return this.#project.sourceMap;
    }

    let sourceMapSource;
    if (this.mode === 'development') {
      sourceMapSource = this.#project.sourceMap?.development ?? false;
    } else {
      sourceMapSource = this.#project.sourceMap?.production ?? true;
    }

    if (typeof sourceMapSource === 'boolean') {
      return sourceMapSource;
    }

    return sourceMapSource[buildType];
  }

  async readConfigurationFile({ rootDir }: { rootDir: string }) {
    return cosmiconfig('tramvai', {
      searchStrategy: 'none',
      searchPlaces: ['tramvai.config.ts'],
      loaders: {
        '.ts': typescriptLoader(),
      },
    })
      .search(rootDir)
      .then((result) => {
        if (result) {
          this.#configPath = result.filepath;
          return result.config;
        }
        // TODO: add flag to throw error if config not found
        // after migration on new ts config

        return {
          projects: {},
          plugins: [],
        };
      });
  }

  getParams() {
    return this.#parameters;
  }

  updateParam<K extends keyof InputParameters>(name: K, value: InputParameters[K]) {
    this.#parameters[name] = value;
  }

  dehydrate(): SerializableConfig {
    return {
      projectType: this.projectType,
      projectName: this.projectName,
      port: this.port,
      host: this.host,
      staticPort: this.staticPort,
      staticHost: this.staticHost,
      httpProtocol: this.httpProtocol,
      assetsPrefix: this.assetsPrefix,
      output: {
        server: this.outputServer,
        client: this.outputClient,
        static: this.outputStatic,
      },
    };
  }
}
