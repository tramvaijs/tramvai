import { createToken } from '@tinkoff/dippy';
import { ReactCompilerOptions, TranspilationOptions } from '@tramvai/api/lib/config';

export type TranspilerInputParameters = {
  // TODO: rename to "mode"
  env: 'development' | 'production';
  // TODO: useless
  target: 'node' | 'defaults';
  actualTarget: 'node' | 'defaults';
  isServer: boolean;
  generateDataQaTag: boolean;
  enableFillActionNamePlugin: boolean;
  enableFillDeclareActionNamePlugin: boolean;
  typescript: boolean;
  modules: 'es6' | 'commonjs' | false;
  loader: boolean;
  removeTypeofWindow: boolean;
  tramvai: boolean;
  hot: boolean;
  excludesPresetEnv: string[];
  rootDir: string;
  sourceDir: string;
  browsersListTargets: string[];
  reactCompiler: boolean | ReactCompilerOptions;
  include: TranspilationOptions['include'];
  /**
   * Enable or disable `loose` transformations:
   * with swc loader - https://swc.rs/docs/configuration/compilation#jscloose
   * with babel loader - https://babeljs.io/docs/babel-preset-env#loose
   */
  loose?: boolean;
  /**
   * Enable or disable external transpiler runtime helpers:
   * with swc loader, pass value directly to `jsc.externalHelpers` option - https://swc.rs/docs/configuration/compilation#jscexternalhelpers
   * with babel loader, when `false`, disable `@babel/plugin-transform-runtime` - https://babeljs.io/docs/babel-plugin-transform-runtime
   */
  externalHelpers?: boolean;
};

export type Transpiler = {
  /**
   * Name of loader for logging purpose
   */
  name: string;
  /**
   * Name of webpack loader for processing JS and TS files
   */
  loader: string;
  /**
   * Configuration object to provided webpack loader
   */
  configFactory: (parameters: TranspilerInputParameters) => Record<string, any>;
  /**
   * Enable or not "thread-loader"
   */
  useThreadLoader?: boolean;
  /**
   * Warmup or not "thread-loader"
   */
  warmupThreadLoader?: boolean;
};

/**
 * @description Options for babel-loader or swc-loader
 */
export const RSPACK_TRANSPILER_TOKEN = createToken<Transpiler>('tramvai rspack builder transpiler');

/**
 * @description Options for babel-loader or swc-loader
 */
export const WEBPACK_TRANSPILER_TOKEN = createToken<Transpiler>('tramvai webpack transpiler');
