import path from 'node:path';
import type { TransformOptions } from '@babel/core';
import { WebpackTranspilerInputParameters } from '@tramvai/plugin-webpack-builder';
import { hasJsxRuntime } from '@tramvai/api/lib/utils/react';
import { getReactCompilerPlugin } from './plugins/react-compiler';

const envConfig: Record<string, any> = {
  production: {
    plugins: [
      '@babel/plugin-transform-react-constant-elements',
      [
        'transform-react-remove-prop-types',
        {
          removeImport: true,
        },
      ],
    ],
  },
};

export const configFactory = ({
  env = 'development',
  isServer = false,
  modules = false,
  actualTarget,
  generateDataQaTag = true,
  enableFillActionNamePlugin = false,
  enableFillDeclareActionNamePlugin = false,
  // for testing only!
  // @ts-expect-error
  markCreateTokenAsPure = true,
  typescript = false,
  loader = true,
  removeTypeofWindow,
  tramvai = false,
  hot = false,
  excludesPresetEnv,
  browsersListTargets,
  reactCompiler = false,
  loose = true,
  externalHelpers = true,
}: Partial<WebpackTranspilerInputParameters>) => {
  const cfg = envConfig[env] || {};

  const babelConfig: Record<string, any> = {
    // по умолчанию sourceType: 'module' и тогда бабель рассматривает все файлы как es-модули, что может
    // вызвать проблемы в некоторых случаях когда бабель обрабатывает уже скомпиленный в commonjs файл
    // как модуль добавляя в него es-импорты и вводя этим вебпак в ступор на счет типа файла
    // unambiguos - режим когда бабель попытается предугадать тип компилируемого файла и уже на этой
    // основе добавлять соответствующие импорты
    sourceType: 'unambiguous' as const,

    // Это необходимо для того, чтобы деструктуризация array-like сущностей, например, Set
    // не приводила к невалидному коду при сборке для старых браузеров:
    // [...new Set()] => [].concat(new Set())
    // https://babeljs.io/docs/assumptions#arraylikeisiterable
    assumptions: {
      arrayLikeIsIterable: true,
      iterableIsArray: false,
    },

    presets: [
      [
        '@babel/preset-env',
        {
          modules,
          useBuiltIns: 'entry',
          // from core-js version depends on what polyfills will be included with `useBuiltIns: 'entry'` option
          // this logic is here - https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/modules-by-versions.mjs
          corejs: require('core-js/package.json').version,
          // TODO: will be deprecated in babel@8 - https://babeljs.io/docs/babel-preset-env#loose
          loose,
          targets: browsersListTargets,
          browserslistEnv: actualTarget,
          bugfixes: true,
          exclude: excludesPresetEnv,
        },
      ],
      [
        '@babel/preset-react',
        {
          runtime: hasJsxRuntime() ? 'automatic' : 'classic',
          useSpread: true,
          development: env === 'development',
        },
      ],
      typescript && '@babel/preset-typescript',
    ]
      .concat(cfg.presets || [])
      .filter(Boolean) as TransformOptions['presets'],

    plugins: [
      // React compiler must be the first plugin in the chain
      getReactCompilerPlugin({ isServer, options: reactCompiler }),
      // TODO: useESModules is deprecated and should work automatically - https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
      externalHelpers && [
        '@babel/transform-runtime',
        { useESModules: !(isServer && env === 'development') },
      ],
      path.resolve(__dirname, './plugins/lazy-component/legacy-universal-replace'), // TODO: удалить плагин после того как отпадёт необходимость поддерживать легаси
      path.resolve(__dirname, './plugins/lazy-component/lazy-component'),
      enableFillDeclareActionNamePlugin &&
        path.resolve(__dirname, './plugins/fill-declare-action-name'),
      generateDataQaTag && path.resolve(__dirname, './plugins/react-element-info-unique'), // Собственный плагин. Необходимо удалить в будущем
      enableFillActionNamePlugin && path.resolve(__dirname, './plugins/fill-action-name'), // Собственный плагин. Необходимо удалить в будущем
      markCreateTokenAsPure && path.resolve(__dirname, './plugins/create-token-pure'),
      '@tinkoff/babel-plugin-lodash/cjs',
      isServer && 'babel-plugin-dynamic-import-node',
      [
        '@babel/plugin-proposal-decorators',
        {
          legacy: true,
        },
      ],
      '@babel/plugin-proposal-export-default-from',
      removeTypeofWindow && [
        'transform-define',
        {
          'typeof window': isServer ? 'undefined' : 'object',
        },
      ],
      tramvai && env === 'development' && path.resolve(__dirname, './plugins/provider-stack'),
      !isServer &&
        env === 'development' &&
        hot && ['react-refresh/babel', { skipEnvCheck: process.env.NODE_ENV === 'test' }],
    ]
      .concat(cfg.plugins || [])
      .filter(Boolean),
  };

  if (typeof browsersListTargets !== 'undefined') {
    // to prevent from reading browserslist config for every processed module (sometimes it is not cached in browserslist),
    // don't know why, but target from preset-env plugin options is ignored from this process
    babelConfig.targets = browsersListTargets;
  }

  const loaderConfig = loader
    ? {
        // TODO: why this value?
        cwd: path.resolve(__dirname, '..', '..'),
        compact: false,
      }
    : {};

  return {
    ...babelConfig,
    ...loaderConfig,
  };
};
