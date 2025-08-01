import fs from 'node:fs';
import mergeDeep from '@tinkoff/utils/object/mergeDeep';
import { createToken } from '@tinkoff/dippy';
import type { DeduplicateStrategy } from '@tinkoff/webpack-dedupe-plugin';
import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import type { Config as SvgoConfig } from 'svgo';
import type { TramvaiPlugin } from '../core/plugin';
import { resolveAbsolutePathForFile } from '../utils/path';
import { packageVersion } from '../utils/package-version';

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
   * @description Inspect server.js process
   * @default false
   */
  inspectServerRuntime?: boolean;
  // TODO: separate inspect for client and server build?
  /**
   * @description Inspect build process
   * @default false
   */
  inspectBuildProcess?: boolean;
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
};

export type Project = ApplicationProject | ChildAppProject;

export interface BaseProject {
  /**
   * [svgo](https://github.com/svg/svgo) configuration, used for SVG and [SVGR](https://react-svgr.com/) optimization
   */
  svgo?: {
    plugins?: SvgoConfig['plugins'];
  };
  /**
   * Enables data-qa-tag plugin for transpiler
   */
  generateDataQaTag?: boolean;
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
  experiments?: ApplicationExperiments;
  postcss?: PostcssOptions;
  polyfill?: string;
  modernPolyfill?: string;
  dedupe?: DedupeOptions;
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
  staticPort: number;
  staticHost: string;
  httpProtocol: string;
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
  config: Configuration;
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
  #config: Configuration | null;
  #extraConfig: Partial<Configuration>;
  #project: Project | null;
  #configPath: string | null;
  #extensions: ExtensionToken[] = [];

  constructor(parameters: InputParameters, extraConfiguration?: Partial<Configuration>) {
    this.#parameters = parameters;
    this.#config = null;
    this.#extraConfig = extraConfiguration ?? {};
    this.#project = null;
    this.#configPath = null;
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
  }

  get extensions(): {
    [key in keyof ConfigurationExtensions]: () => ReturnType<ConfigurationExtensions[key]>;
  } {
    // TODO: memoize
    return this.#extensions.reduce((extensions, currentExtension) => {
      for (const key in currentExtension) {
        extensions[key] = () =>
          currentExtension[key]({
            config: this.#config!,
            parameters: this.#parameters,
            project: this.#project!,
          });
      }
      return extensions;
    }, {});
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

  get staticHost() {
    return this.#parameters?.staticHost ?? 'localhost';
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

  get inspectServerRuntime() {
    return this.#parameters.inspectServerRuntime ?? false;
  }

  get inspectBuildProcess() {
    // TODO: respect process.env.TRAMVAI_INSPECT_BUILD_PROCESS here?
    return this.#parameters.inspectBuildProcess ?? false;
  }

  get verboseLogging() {
    return this.#parameters.verboseLogging ?? false;
  }

  get sourceDir() {
    return this.#project!.sourceDir ?? 'src';
  }

  get entryFile() {
    return this.#project!.entryFile ?? 'index.ts';
  }

  get showProgress() {
    return this.#parameters.showProgress;
  }

  get mode() {
    return this.#parameters.mode ?? 'development';
  }

  get projectName() {
    return this.#project!.name;
  }

  get projectVersion() {
    return (
      packageVersion({ mode: this.mode, sourceDir: this.sourceDir, rootDir: this.rootDir }) ||
      'unknown'
    );
  }

  get projectType() {
    return this.#project!.type;
  }

  get polyfill() {
    if (this.#project!.type === 'child-app') {
      return null;
    }

    return this.#project!.polyfill;
  }

  get modernPolyfill() {
    if (this.#project!.type === 'child-app') {
      return null;
    }

    return this.#project!.modernPolyfill;
  }

  get outputServer() {
    if (this.#project!.type === 'child-app') {
      return this.#project!.output ?? 'dist/child-app';
    }
    return this.#project!.output?.server ?? 'dist/server';
  }

  get outputClient() {
    if (this.#project!.type === 'child-app') {
      return this.#project!.output ?? 'dist/child-app';
    }
    return this.#project!.output?.client ?? 'dist/client';
  }

  get outputStatic() {
    if (this.#project!.type === 'child-app') {
      return this.#project!.output ?? 'dist/child-app';
    }
    return this.#project!.output?.static ?? 'dist/static';
  }

  get fileSystemPages(): FileSystemPagesOptions | null {
    if (this.#project!.type === 'child-app') {
      return null;
    }
    const fileSystemPages = this.#project!.fileSystemPages ?? ({} as FileSystemPagesOptions);

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

  get postcss(): PostcssOptions | null {
    if (this.#project!.type === 'child-app') {
      return null;
    }
    return this.#project!.postcss ?? {};
  }

  get experiments(): ApplicationExperiments | null {
    if (this.#project!.type === 'child-app') {
      return null;
    }

    const experiments = this.#project!.experiments ?? {};

    return {
      viewTransitions: experiments.viewTransitions ?? false,
      reactTransitions: experiments.reactTransitions ?? false,
    };
  }

  get dedupe(): DedupeOptions {
    const {
      enabled = true,
      enabledDev = false,
      strategy = 'equality',
      ignore,
    } = this.#project!.dedupe ?? {};

    return { enabled, enabledDev, strategy, ignore };
  }

  get svgo(): BaseProject['svgo'] {
    return this.#project!.svgo ?? {};
  }

  get generateDataQaTag() {
    return this.#project!.generateDataQaTag ?? false;
  }

  async readConfigurationFile({ rootDir }: { rootDir: string }) {
    return cosmiconfig('tramvai', {
      searchStrategy: 'none',
      loaders: {
        // TODO: resolve only .ts files
        '.ts': TypeScriptLoader(),
      },
    })
      .search(rootDir)
      .then((result) => {
        if (result) {
          this.#configPath = result.filepath;
          return result.config;
        }
        throw Error(`tramvai configuration file not found`);
      });
  }

  dehydrate(): SerializableConfig {
    return {
      projectType: this.projectType,
      staticPort: this.staticPort,
      staticHost: this.staticHost,
      httpProtocol: this.httpProtocol,
      output: {
        server: this.outputServer,
        client: this.outputClient,
        static: this.outputStatic,
      },
    };
  }
}
