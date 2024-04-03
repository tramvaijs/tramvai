import type Config from 'webpack-chain';
import type { PluginConfig, Config as SvgoConfig } from 'svgo';
import type { ConfigManager } from '../../../config/configManager';
import type { CliConfigEntry } from '../../../typings/configEntry/cli';
import { addTranspilerLoader, getTranspilerConfig } from './transpiler';

export const addSvgrLoader = (
  configManager: ConfigManager<CliConfigEntry>,
  config: Config,
  svgoOptions: Record<string, any>
) => {
  const transpilerConfig = getTranspilerConfig(configManager);
  // based on https://github.com/facebook/create-react-app/issues/11213#issuecomment-883466601
  const svgrConfig = config.module
    .rule('svgr')
    .test(/\.svg$/)
    // @todo: `issuer: /\.tsx?$/` нужен или нет?
    .set('resourceQuery', /react/)
    .use('svgr-transpiler')
    .batch(
      addTranspilerLoader(configManager, {
        ...transpilerConfig,
        typescript: true,
      })
    )
    .end();

  svgrConfig.use('svgr').loader('@svgr/webpack').options({ babel: false, svgo: svgoOptions }).end();
};

export const getSvgoOptions = (
  configManager: ConfigManager<CliConfigEntry>
): SvgoConfig & { configFile?: boolean } => {
  return {
    configFile: false,
    plugins: (configManager.svgo?.plugins as any as PluginConfig[]) ?? [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false,
            collapseGroups: false,
          },
        },
      },
    ],
  };
};
