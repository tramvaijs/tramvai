import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import svgr from '@svgr/rollup';
import type { BuildParams } from './build.h';

const EXTERNALS_PATTERN = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^@tramvai\//,
  /^@tramvai-tinkoff\//,
  /^@tinkoff\/router$/,
  /\.(svg\?react)$/,
];

const isExternalDependency = (id, externals) =>
  externals.some((dep) => id === dep || id.startsWith(`${dep}/`));

export const buildCheckExternal = (params: BuildParams) => {
  const externals = [
    ...(params.options.externals ?? []),
    ...Object.keys(params.packageJSON.peerDependencies ?? {}),
  ];

  return (path: string) => {
    return (
      isExternalDependency(path, externals) ||
      EXTERNALS_PATTERN.some((pattern) => pattern.test(path))
    );
  };
};

export const plugins = [
  nodeResolve(),
  commonjs(),
  svgr(),
  postcss({ inject: true, modules: true }),
];
