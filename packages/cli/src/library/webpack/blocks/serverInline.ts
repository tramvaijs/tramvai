import type Config from 'webpack-chain';
import type { ConfigManager } from '../../../config/configManager';
import type { CliConfigEntry } from '../../../typings/configEntry/cli';
import { addTranspilerLoader, getTranspilerConfig } from '../utils/transpiler';

export const serverInline = (configManager: ConfigManager<CliConfigEntry>) => (config: Config) => {
  const clientConfigManager = configManager.withSettings({ buildType: 'client' });

  const addInlineHandler = (type: string) => {
    config.module
      .rule(type)
      .oneOf('inline')
      .before('project')
      .test(new RegExp(`\\.inline(\\.es)?\\.${type}$`))
      .use('transpiler')
      .batch(
        addTranspilerLoader(
          clientConfigManager,
          getTranspilerConfig(clientConfigManager, {
            typescript: type === 'ts',
            // inline transpiler runtime helpers to prevent webpack imports in generated inline scripts
            externalHelpers: false,
            // minimize swc helpers usage to prevent inline scripts bloat, risks is minimal for rarely used inline scripts
            loose: true,
          })
        )
      );
  };

  addInlineHandler('js');
  addInlineHandler('ts');
};
