import { Writable } from 'stream';
import type Config from 'webpack-chain';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import type { CliConfigEntry, ConfigManager } from '../../../api';
import { WEBPACK_DEBUG_STATS_OPTIONS } from '../constants/stats';
import { dedupe } from '../blocks/dedupe';
import { ignoreWarnings } from '../utils/warningsFilter';

const filters = ignoreWarnings.map(
  ({ message }) =>
    (text) =>
      message.test(text)
);

const stderrWithWarningFilters = new Writable({
  write(chunk, encoding, callback) {
    const chunkStr = chunk.toString();

    if (filters.some((filter) => filter(chunkStr))) {
      callback();
      return;
    }

    process.stderr.write(chunk, encoding, callback);
  },
});

stderrWithWarningFilters.on('error', (error) =>
  console.error('[infrastructureLogging] stream error', error)
);

export default (configManager: ConfigManager<CliConfigEntry>) => (config: Config) => {
  config.plugin('case-sensitive-path').use(CaseSensitivePathsPlugin);

  config.stats({
    preset: 'errors-warnings',
    // отключает уведомление об успешной компиляции, его уже выводит webpackbar
    warningsCount: false,
    ...(configManager.verboseWebpack ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
  });

  config.set('infrastructureLogging', {
    level: 'warn',
    ...(configManager.verboseWebpack ? { level: 'verbose', debug: true } : {}),
    ...(configManager.verboseWebpack || configManager.debug
      ? {}
      : { stream: stderrWithWarningFilters }),
  });

  config.output.pathinfo(false);

  config.module.set('unsafeCache', true);

  if (configManager.dedupe.enabledDev) {
    config.batch(dedupe(configManager));
  }

  return config;
};
