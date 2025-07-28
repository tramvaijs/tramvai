import path from 'node:path';
import { existsSync } from 'node:fs';

import { WebpackTranspilerInputParameters } from '@tramvai/plugin-webpack-builder';
import isEmpty from '@tinkoff/utils/is/empty';
import { sync as resolve } from 'resolve';
import findCacheDir from 'find-cache-dir';
import type { Options as SwcOptions } from '@swc/core';

const TRAMVAI_SWC_TARGET_PATH = '@tramvai/swc-integration/target/wasm32-wasi';

const NOT_SUPPORTED_FIELDS: (keyof WebpackTranspilerInputParameters)[] = [
  'enableFillActionNamePlugin',
];
let warningWasShown = false;

export const configFactory = (config: Partial<WebpackTranspilerInputParameters>): SwcOptions => {
  const {
    env = 'development',
    isServer = false,
    modules = false,
    excludesPresetEnv,
    browsersListTargets,
    typescript = false,
    hot = false,
    removeTypeofWindow,
    tramvai = false,
    rootDir = process.cwd(),
    generateDataQaTag = false,
    // disabled because `arrayLikeIsIterable` and `iterableIsArray` assumtions is not supported yet in swc,
    // this can leads to incorrect code generation e.g. when Set with spread is used - `[...new Set()] => [].concat(new Set())`
    // TCORE-4904
    loose = false,
    externalHelpers = true,
  } = config;

  if (!warningWasShown) {
    for (const field of NOT_SUPPORTED_FIELDS) {
      if (config[field] && !isEmpty(config[field])) {
        console.warn(
          `@tramvai/swc-integration do not support "${field}" configuration. Consider removing it from tramvai.json`
        );

        warningWasShown = true;
      }
    }

    const swcrcPath = path.resolve(rootDir, '.swcrc');

    if (existsSync(swcrcPath)) {
      console.warn(
        `Found .swcrc config in the app root directory ("${swcrcPath}").
Having swc config may conflict with @tramvai/cli configuration`
      );

      warningWasShown = true;
    }
  }

  const resolveWasmFile = (pluginName: string, type: 'debug' | 'release') => {
    return resolve(`${TRAMVAI_SWC_TARGET_PATH}/${type}/${pluginName}.wasm`);
  };

  const resolveTramvaiSwcPlugin = (pluginName: string) => {
    try {
      return resolveWasmFile(pluginName, 'debug');
    } catch (_) {
      try {
        return resolveWasmFile(pluginName, 'release');
      } catch (__) {
        throw new Error(
          `Cannot find tramvai swc-plugin "${pluginName}" related to the "${rootDir}" directory`
        );
      }
    }
  };
  function hasJsxRuntime() {
    try {
      resolve('react/jsx-runtime', { basedir: rootDir });
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    env: {
      targets: browsersListTargets,
      // Use relevant core-js version, because it affects which polyfills are included
      // https://github.com/swc-project/swc/blob/main/crates/swc_ecma_preset_env/data/core-js-compat/modules-by-versions.json
      coreJs: require('core-js/package.json').version,
      // disabled because `arrayLikeIsIterable` and `iterableIsArray` assumtions is not supported yet in swc,
      // this can leads to incorrect code generation e.g. when Set with spread is used - `[...new Set()] => [].concat(new Set())`
      // TCORE-4904
      loose,
      exclude: excludesPresetEnv,
      mode: 'entry',
    },
    module: {
      type: modules || 'es6',
    },
    isModule: 'unknown',
    jsc: {
      externalHelpers,
      parser: {
        syntax: typescript ? 'typescript' : 'ecmascript',
        decorators: true,
        tsx: true,
        jsx: true,
        exportDefaultFrom: true,
      },
      transform: {
        legacyDecorator: true,
        react: {
          runtime: hasJsxRuntime() ? 'automatic' : 'classic',
          development: env === 'development',
          refresh: hot && env === 'development' && !isServer,
        },
        optimizer: {
          globals: {
            // let the webpack replace NODE_ENV as replacement with swc may mess up with tests
            envs: [],
            typeofs: removeTypeofWindow
              ? {
                  window: isServer ? 'undefined' : 'object',
                }
              : {},
          },
        },
      },
      experimental: {
        cacheRoot: findCacheDir({ cwd: rootDir, name: 'swc' }),
        plugins: [
          [resolveTramvaiSwcPlugin('create_token_pure'), {}],
          [resolveTramvaiSwcPlugin('lazy_component'), {}],
          isServer && [resolveTramvaiSwcPlugin('dynamic_import_to_require'), {}],
          tramvai && env === 'development' && [resolveTramvaiSwcPlugin('provider_stack'), {}],
          generateDataQaTag && [resolveTramvaiSwcPlugin('react_element_info_unique'), {}],
        ].filter(Boolean) as Array<[string, Record<string, any>]>,
      },
    },
  };
};
