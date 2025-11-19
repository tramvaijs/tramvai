import type { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';
import { AnalyzePlugin } from '../types';

type options = ConstructorParameters<typeof RsdoctorWebpackPlugin<[]>>;
export class RsdoctorAnalyzePlugin extends AnalyzePlugin {
  requireDeps = [];

  options: options = [
    {
      linter: {
        level: 'Ignore',
      },
    },
  ];

  // rsdoctor поднимает dev server
  afterBuild = () => new Promise(() => null);

  get plugin() {
    // eslint-disable-next-line import/no-unresolved
    return require('@rsdoctor/webpack-plugin').RsdoctorWebpackMultiplePlugin;
  }
}
