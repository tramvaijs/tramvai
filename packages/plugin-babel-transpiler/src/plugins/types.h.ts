import type { PluginObj, PluginPass, template, types } from '@babel/core';

export interface Babel {
  types: typeof types;
  template: typeof template;
}

export type Plugin<PluginOptions = void> = (babel: Babel) => PluginObj<PluginPass & PluginOptions>;
