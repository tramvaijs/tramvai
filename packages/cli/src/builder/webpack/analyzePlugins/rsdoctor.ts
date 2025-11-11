import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';
import { AnalyzePlugin } from '../types';

type options = ConstructorParameters<typeof RsdoctorWebpackPlugin<[]>>;
export class RsdoctorAnalyzePlugin extends AnalyzePlugin {
  requireDeps = [];

  options: options = [];

  plugin = RsdoctorWebpackPlugin;

  // rsdoctor поднимает dev server
  afterBuild = () => new Promise(() => null);
}
