import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

import type { Configuration } from 'webpack';

import { ConfigService, SharpEncodeOptions } from '@tramvai/api/lib/config';

export const createOptimizeOptions = ({
  config,
}: {
  config: ConfigService;
}): Configuration['optimization'] => {
  return {
    minimizer: [
      new ImageMinimizerPlugin({
        // lossless minify - https://github.com/webpack-contrib/image-minimizer-webpack-plugin/?tab=readme-ov-file#optimize-with-sharp
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              // @ts-ignore Wrong typings
              encodeOptions: {
                jpeg: {
                  quality: 100,
                  mozjpeg: true,
                },
                png: {
                  palette: true,
                },
              },
            } satisfies SharpEncodeOptions,
          },
          {
            implementation: ImageMinimizerPlugin.svgoMinify,
            options: config.svgo,
          },
        ],
        ...config.imageOptimization.options,
      }),
      // Keep default minimizer settings
      '...',
    ],
  };
};
