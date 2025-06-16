import type { StatsOptions } from 'webpack';

export const DEFAULT_STATS_OPTIONS: StatsOptions = {
  all: false, // отключаем большинство ненужной информации
  publicPath: true,
  assets: true,
  outputPath: true, // выводит информацию о том в какой папке хранится билд на диске
  chunkGroups: true, // позволяет получить в stats поле namedChunkGroups которое потом используется в webpack-flush-chunks для получения чанков-зависимостей
  ids: true, // необходимо чтобы в chunksGroups были выставлены связи между модулями
  entrypoints: true, // нужно, чтобы узнать чанки для каждой точки входа
};

export const DEFAULT_STATS_FIELDS: string[] = [
  'publicPath',
  'outputPath',
  'assetsByChunkName',
  'namedChunkGroups',
  'entrypoints',
];

export const DEV_STATS_OPTIONS: StatsOptions = {
  ...DEFAULT_STATS_OPTIONS,
  chunks: true, // нужно, чтобы получить название файлов для shared чанков в development режиме
};

export const DEV_STATS_FIELDS = [...DEFAULT_STATS_FIELDS, 'chunks'];

export const WEBPACK_DEBUG_STATS_OPTIONS: StatsOptions = {
  logging: 'verbose',
};

export const WEBPACK_DEBUG_STATS_FIELDS = Object.keys(WEBPACK_DEBUG_STATS_OPTIONS);
