import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

import type { Configuration as WebpackConfig } from 'webpack';
import type { Optimization } from '@rspack/core';

import { ConfigService, SharpEncodeOptions } from '@tramvai/api/lib/config';

type CompilerMap = {
  webpack: WebpackConfig['optimization'];
  rspack: Optimization;
};

export const createOptimizeOptions = <T extends keyof CompilerMap>({
  config,
  target,
}: {
  config: ConfigService;
  target: 'client' | 'server';
}): CompilerMap[T] => {
  const runtimeChunk = config.extensions.runtimeChunk();

  return {
    ...(target === 'client' ? { runtimeChunk } : {}),
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
