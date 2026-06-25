import type { ConfigService } from '@tramvai/api/lib/config';
import type webpack from 'webpack';

import type { Configuration as WebpackConfig } from 'webpack';
import type { DevTool, RuleSetRule } from '@rspack/core';

type DevToolMap = {
  webpack: WebpackConfig['devtool'];
  rspack: DevTool;
};

type RuleSetMap = {
  webpack: webpack.RuleSetRule[];
  rspack: RuleSetRule[];
};

export const createSourceMaps = <T extends keyof DevToolMap>({
  config,
  target,
}: {
  config: ConfigService;
  target: 'client' | 'server';
}) => {
  const sourceMapsConfig: {
    rules: RuleSetMap[T];
    devtoolModuleFilenameTemplate: string | undefined;
    devtool: DevToolMap[T];
  } = {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: [
          {
            loader: 'source-map-loader',
          },
        ],
      },
    ],
    devtoolModuleFilenameTemplate: config.debug
      ? // for better file structure view in chrome devtools
        'file://[absolute-resource-path]'
      : '[absolute-resource-path]',
    // TODO: 'source-map' in prod for server build
    devtool: target === 'server' ? 'inline-source-map' : 'source-map',
  };

  return sourceMapsConfig;
};
