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
}): {
  rules: RuleSetMap[T];
  devtool: DevToolMap[T];
} => {
  return {
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
    // Chrome devtools does not support source maps with remote debug nodejs
    // PR with fix: https://github.com/nodejs/node/pull/58077
    devtool: target === 'server' ? 'inline-source-map' : 'source-map',
  };
};
