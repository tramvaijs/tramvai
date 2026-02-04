import type StatoscopeWebpackPlugin from '@statoscope/webpack-plugin';

import { AnalyzePlugin } from '../types';

export class StatoscopeAnalyzePlugin extends AnalyzePlugin {
  requireDeps = [];

  options = (): ConstructorParameters<typeof StatoscopeWebpackPlugin> => [
    {
      statsOptions: { all: true },
    },
  ];

  get plugin() {
    // eslint-disable-next-line import/no-unresolved
    return require('@statoscope/webpack-plugin').default;
  }
}
