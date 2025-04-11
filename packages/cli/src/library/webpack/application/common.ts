import type Config from 'webpack-chain';
import { container } from 'webpack';
import { getSharedModules } from '../child-app/moduleFederationShared';
import type { ModuleFederationPluginOptions } from '../types/webpack';
import type { ConfigManager } from '../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../typings/configEntry/application';
import type { ModuleFederationIgnoreEntriesOptions } from '../plugins/ModuleFederationIgnoreEntries';
import { ModuleFederationIgnoreEntries } from '../plugins/ModuleFederationIgnoreEntries';
import { rootErrorBoundaryFactory } from '../blocks/rootErrorBoundary';
import type { ModuleFederationFixRangeOptions } from '../plugins/ModuleFederationFixRange';
import { ModuleFederationFixRange } from '../plugins/ModuleFederationFixRange';
import { FileStatsPlugin } from '../plugins/FileStats';

export const commonApplication =
  (configManager: ConfigManager<ApplicationConfigEntry>) => (config: Config) => {
    config.plugin('module-federation').use(container.ModuleFederationPlugin, [
      {
        name: 'host',
        shared: getSharedModules(configManager),
      } as ModuleFederationPluginOptions,
    ]);

    if (configManager.withModulesStats) {
      config.plugin('stats-modules-plugin').use(FileStatsPlugin, [
        {
          filename: 'stats-modules.json',
          stats: {
            chunks: true,
            chunkModules: true,
          },
        },
      ]);
    }

    config
      .plugin('module-federation-ignore-entries')
      .use(ModuleFederationIgnoreEntries, [
        { entries: ['polyfill', 'modern.polyfill'] } as ModuleFederationIgnoreEntriesOptions,
      ]);

    config.plugin('module-federation-validate-duplicates').use(ModuleFederationFixRange, [
      {
        flexibleTramvaiVersions: configManager.shared.flexibleTramvaiVersions,
      } as ModuleFederationFixRangeOptions,
    ]);

    config.batch(rootErrorBoundaryFactory(configManager));
  };
