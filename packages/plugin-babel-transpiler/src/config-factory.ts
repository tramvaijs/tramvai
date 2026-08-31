import path from 'node:path';
import type { TransformOptions } from '@babel/core';
import type { TranspilerInputParameters } from '@tramvai/plugin-base-builder/lib/shared/transpiler';
import { hasJsxRuntime } from '@tramvai/plugin-base-builder/lib/utils';
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
  // @deprecated
  env = 'development',
  mode = env,
  isServer = false,
  modules = false,
  actualTarget,
  generateDataQaTag = true,
  enableFillDeclareActionNamePlugin = false,
  enableFillActionNamePlugin = false,
  // for testing only!
  // @ts-expect-error
  markCreateTokenAsPure = true,
  typescript = false,
  loader = true,
  removeTypeofWindow = true,
  tramvai = false,
  hot = false,
  browsersListTargets,
  reactCompiler = false,
  loose = true,
  externalHelpers = true,
}: Partial<TranspilerInputParameters>) => {
  const cfg = envConfig[mode] || {};

  const babelConfig: Record<string, any> = {
    // по умолчанию sourceType: 'module' и тогда бабель рассматривает все файлы как es-модули, что может
    // вызвать проблемы в некоторых случаях когда бабель обрабатывает уже скомпиленный в commonjs файл
    // как модуль добавляя в него es-импорты и вводя этим вебпак в ступор на счет типа файла
    // unambiguos - режим когда бабель попытается предугадать тип компилируемого файла и уже на этой
    // основе добавлять соответствующие импорты
    sourceType: 'unambiguous' as const,

    presets: [
      [
        '@babel/preset-env',
        {
          modules,
          useBuiltIns: 'entry',
          // from core-js version depends on what polyfills will be included with `useBuiltIns: 'entry'` option
          // this logic is here - https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/modules-by-versions.mjs
          corejs: require('core-js/package.json').version,
          loose,
          targets: browsersListTargets,
          browserslistEnv: actualTarget,
          bugfixes: true,
        },
      ],
      [
        '@babel/preset-react',
        {
          runtime: hasJsxRuntime() ? 'automatic' : 'classic',
          useSpread: true,
          development: mode === 'development',
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
        { useESModules: !(isServer && mode === 'development') },
      ],
      path.resolve(__dirname, './plugins/lazy-component/legacy-universal-replace'), // TODO: удалить плагин после того как отпадёт необходимость поддерживать легаси
      path.resolve(__dirname, './plugins/lazy-component/lazy-component'),
      enableFillDeclareActionNamePlugin &&
        path.resolve(__dirname, './plugins/fill-declare-action-name'),
      enableFillActionNamePlugin && path.resolve(__dirname, './plugins/fill-action-name'), // Собственный плагин. Необходимо удалить в будущем
      generateDataQaTag && path.resolve(__dirname, './plugins/react-element-info-unique'), // Собственный плагин. Необходимо удалить в будущем
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
      tramvai && mode === 'development' && path.resolve(__dirname, './plugins/provider-stack'),
      !isServer &&
        mode === 'development' &&
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
