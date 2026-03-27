import { defineTramvaiConfig } from '@tramvai/api/lib/config';
import { WebpackBuilderPlugin } from '@tramvai/plugin-webpack-builder';
import { RspackBuilderPlugin } from '@tramvai/plugin-rspack-builder';
import { SwcTranspilerPlugin } from '@tramvai/plugin-swc-transpiler';
import { BabelTranspilerPlugin } from '@tramvai/plugin-babel-transpiler';
import { PwaPlugin } from '@tramvai/plugin-webpack-pwa';

export default defineTramvaiConfig({
  // plugins: [RspackBuilderPlugin, SwcTranspilerPlugin],
  plugins: [WebpackBuilderPlugin, BabelTranspilerPlugin, PwaPlugin],
  projects: {
    'cli-rewrited': {
      name: 'cli-rewrited',
      type: 'application',
      pwa: {
        sw: {
          scope: '/scope/',
        },
        workbox: {
          enabled: true,
        },
        webmanifest: {
          enabled: true,
          dest: '/manifest.[hash].webmanifest',
          name: 'T-Bank',
          short_name: 'Т-Банк',
        },
      },
      transpilation: {
        include: {
          development: 'none',
        },
      },
      fileSystemPages: {
        enabled: true,
        pagesDir: false,
      },
      splitChunks: {
        mode: 'granularChunks',
        frameworkChunk: false,
      },
    },
  },
});
