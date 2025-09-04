import path from 'node:path';
import type { ConfigService } from '@tramvai/api/lib/config';
import type webpack from 'webpack';

export const createSourceMaps = ({
  config,
  target,
}: {
  config: ConfigService;
  target: 'client' | 'server';
}): {
  rules: webpack.RuleSetRule[];
  devtool: webpack.Configuration['devtool'];
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
