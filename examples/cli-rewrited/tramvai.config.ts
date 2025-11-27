import path from 'node:path';

import { defineTramvaiConfig } from '@tramvai/api/lib/config';
import { WebpackBuilderPlugin } from '@tramvai/plugin-webpack-builder';
import { BabelTranspilerPlugin } from '@tramvai/plugin-babel-transpiler';
import { PwaPlugin } from '@tramvai/plugin-webpack-pwa';

export default defineTramvaiConfig({
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
