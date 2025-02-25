import isNil from '@tinkoff/utils/is/nil';
import isArray from '@tinkoff/utils/is/array';
import isObject from '@tinkoff/utils/is/object';
import prop from '@tinkoff/utils/object/prop';
import mapObj from '@tinkoff/utils/object/map';
import { resolve } from 'path';
import fs from 'fs';
import type { BuildType } from '../typings/projectType';
import type { Env } from '../typings/Env';
import type { ConfigEntry, OverridableOption } from '../typings/configEntry/common';
import { isOverridableOption } from '../typings/configEntry/common';
import { isApplication, isChildApp, isModule, validate } from './validate';
import moduleVersion from '../utils/moduleVersion';
import { packageVersion } from '../utils/packageVersion';
import { showConfig } from './showConfig';
import type { Target } from '../typings/target';
import { PortManager } from '../models/port-manager';

// @TODO: maybe split settings depending on env?
export interface Settings<E extends Env> {
  // env variables from @tramvai/cli JS api commands (not exists in process.env)
  appEnv?: Record<string, any>;
  // build environment
  env?: E;
  rootDir?: string;
  version?: string;
  buildType?: BuildType;
  debug?: string | boolean;
  verboseWebpack?: boolean;
  trace?: boolean;
  sourceMap?: boolean;
  host?: string;
  https?: boolean;
  port?: number;
  staticHost?: string;
  staticPort?: number;
  profile?: boolean;
  noServerRebuild?: boolean;
  noClientRebuild?: boolean;
  modern?: boolean;
  resolveSymlinks?: boolean;
  showConfig?: boolean;
  onlyBundles?: string[];
  disableProdOptimization?: boolean;
  fileCache?: boolean;
}

const getOption = <T>(optionName: string, cfgs: any[], dflt: T): T => {
  const getter = prop(optionName);

  for (let i = 0; i < cfgs.length; i++) {
    const value = getter(cfgs[i]);

    if (!isNil(value)) {
      return value;
    }
  }

  return dflt;
};

type OmitOverridable<T extends Record<string, any>> = {
  [key in keyof T]: T[key] extends OverridableOption<infer U>
    ? U
    : T[key] extends Record<string, any>
      ? OmitOverridable<T[key]>
      : T[key];
};

const omitEnvOptions = <T extends Record<string, any>>(
  env: Env,
  options: T
): OmitOverridable<T> => {
  return mapObj((value) => {
    if (isOverridableOption(value)) {
      return value[env];
    }

    if (isObject(value) && !isArray(value)) {
      return omitEnvOptions(env, value);
    }

    return value;
  }, options);
};

export type ConfigManager<
  C extends ConfigEntry = ConfigEntry,
  E extends Env = Env,
> = OmitOverridable<C> &
  Required<Settings<E>> & {
    target: Target;
    buildPath: string;
    withSettings(settings: Settings<E>): ConfigManager<C, E>;
    dehydrate(): [C, Settings<E>];
    assetsPrefix?: string;
    httpProtocol?: 'https' | 'http';
  };

export const DEFAULT_STATIC_HOST = 'localhost';

// eslint-disable-next-line max-statements, complexity
export const createConfigManager = <C extends ConfigEntry = ConfigEntry, E extends Env = Env>(
  configEntry: C,
  settings: Settings<E>
): ConfigManager<C, E> => {
  const env: E = settings.env ?? ('development' as E);
  const normalizedConfigEntry = omitEnvOptions(env, configEntry);

  const { type } = configEntry;
  const rootDir = settings.rootDir ?? process.cwd();
  const debug = settings.debug ?? false;
  const verboseWebpack = settings.verboseWebpack ?? false;
  const appEnv = settings.appEnv ?? {};
  // First problem, modern build is not supported for CSR mode.
  // Second, in development mode with enabled modern, only modern JS chunks will be generated.
  // With PWA module, only sw.modern.js file exists - but in CSR mode application needs sw.js, which is not generated.
  // In production mode with enabled modern, everything is ok - all type of chunks generated in parallel.
  const disableModernForCsrInDevMode =
    (process.env.TRAMVAI_FORCE_CLIENT_SIDE_RENDERING ||
      appEnv.TRAMVAI_FORCE_CLIENT_SIDE_RENDERING) === 'true' && env === 'development';
  // For Child Apps and dynamic modules legacy build always used
  const disableModernForMicrofrontends = type === 'child-app' || type === 'module';
  const modern =
    disableModernForCsrInDevMode || disableModernForMicrofrontends
      ? false
      : getOption('modern', [settings, configEntry], true);
  const buildType = settings.buildType ?? 'client';
  let target: Target = 'defaults';

  if (buildType === 'server') {
    target = 'node';
  } else if (modern) {
    target = 'modern';
  }

  const config: ConfigManager<C, E> = {
    ...normalizedConfigEntry,
    version:
      (type === 'module' ? moduleVersion(configEntry) : '') ||
      packageVersion(configEntry, env, rootDir) ||
      'unknown',
    trace: false,
    host: '0.0.0.0',
    https: !!settings.https,
    httpProtocol: settings.https ? 'https' : 'http',
    profile: false,
    noClientRebuild: false,
    noServerRebuild: false,
    resolveSymlinks: true,
    disableProdOptimization: false,
    onlyBundles: [],
    // according to measures fileCache in webpack doesn't affect
    // performance much so enable it by default as it always was before
    fileCache: true,
    showConfig: false,
    csr: false,
    ...settings,
    appEnv,
    env,
    rootDir,
    buildType,
    debug,
    verboseWebpack,
    port: Number(settings.port ?? PortManager.DEFAULT_PORT),
    staticHost: settings.staticHost ?? DEFAULT_STATIC_HOST,
    staticPort: Number(
      settings.staticPort ??
        (type === 'module'
          ? PortManager.DEFAULT_MODULE_STATIC_PORT
          : PortManager.DEFAULT_STATIC_PORT)
    ),
    modern,
    // eslint-disable-next-line no-nested-ternary
    sourceMap: debug
      ? // allow to disable sourcemaps with debug flag, when sourceMap passed to cli api
        typeof settings.sourceMap === 'boolean'
        ? settings.sourceMap
        : true
      : getOption('sourceMap', [settings, normalizedConfigEntry], false),
    target,
    buildPath: '',
    withSettings(overrideSettings) {
      return createConfigManager(configEntry, {
        ...settings,
        ...overrideSettings,
      });
    },
    dehydrate() {
      return [
        configEntry,
        {
          ...settings,
          // drop options that couldn't be serialized
          stdout: undefined,
          stderr: undefined,
        },
      ];
    },
  };

  if (isApplication(config)) {
    config.assetsPrefix =
      process.env.ASSETS_PREFIX && process.env.ASSETS_PREFIX !== 'static'
        ? process.env.ASSETS_PREFIX
        : `${config.httpProtocol}://${config.staticHost}:${
            config.staticPort
          }/${config.output.client.replace(/\/$/, '')}/`;
    config.buildPath = resolve(
      rootDir,
      buildType === 'server' ? config.output.server : config.output.client
    );

    const pwa = config.experiments?.pwa;
    if (pwa.webmanifest?.enabled) {
      pwa.webmanifest = {
        ...pwa.webmanifest,
        scope: pwa.webmanifest.scope ?? pwa.sw?.scope,
        name: pwa.webmanifest.name ?? config.name,
        short_name: pwa.webmanifest.short_name ?? config.name,
        theme_color: pwa.webmanifest.theme_color ?? pwa.meta.themeColor,
      };

      if (pwa.webmanifest.dest.includes('[hash]')) {
        if (env === 'production') {
          const crypto = require('crypto');
          const hashSum = crypto.createHash('sha256');
          hashSum.update(JSON.stringify(pwa.webmanifest));
          const currentHash = hashSum.digest('hex');

          pwa.webmanifest.dest = pwa.webmanifest.dest.replace('[hash]', currentHash.substr(0, 8));
        } else {
          pwa.webmanifest.dest = pwa.webmanifest.dest.replace('.[hash]', '').replace('[hash].', '');
        }
      }
    }

    const rootErrorBoundaryPath = resolve(
      config.rootDir,
      config.root,
      config.fileSystemPages.rootErrorBoundaryPath
    );

    config.fileSystemPages.rootErrorBoundaryPath = fs.existsSync(rootErrorBoundaryPath)
      ? rootErrorBoundaryPath
      : undefined;
  } else if (isChildApp(config)) {
    config.buildPath = resolve(rootDir, ...config.output.split('/'));
  } else if (isModule(config)) {
    config.buildPath = resolve(rootDir, ...config.output.split('/'), config.name, config.version);
  }

  if (config.showConfig) {
    showConfig(config);
  }

  validate(config);

  return config;
};
