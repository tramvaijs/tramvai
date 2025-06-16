import { defineTramvaiConfig } from '@tramvai/api/lib/config';
import { WebpackBuilderPlugin } from '@tramvai/plugin-webpack-builder';
import { BabelTranspilerPlugin } from '@tramvai/plugin-babel-transpiler';

export default defineTramvaiConfig({
  plugins: [WebpackBuilderPlugin, BabelTranspilerPlugin],
  projects: {
    'cli-rewrited': {
      name: 'cli-rewrited',
      type: 'application',
      fileSystemPages: {
        enabled: true,
        pagesDir: false,
      },
    },
  },
});
