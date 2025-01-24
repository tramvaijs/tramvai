import type Config from 'webpack-chain';
import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';
import { AnalyzePlugin } from '../types';

export class RsdoctorAnalyzePlugin extends AnalyzePlugin {
  requireDeps = [];

  options: [RsdoctorWebpackPlugin<[]>['options']] = [
    {
      features: ['loader', 'plugins', 'resolver'],
    },
  ];

  plugin = RsdoctorWebpackPlugin;

  patchConfig = (config: Config): Config => {
    super.patchConfigInternal(config);
    // https://github.com/web-infra-dev/rsdoctor/issues/717
    config.set('experiments', { backCompat: true });

    return config;
  };

  // rsdoctor поднимает dev server
  afterBuild = () => new Promise(() => null);
}
