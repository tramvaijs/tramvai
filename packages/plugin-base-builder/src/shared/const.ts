import { Writable } from 'node:stream';

import { ignoreWarnings } from '../utils';

export const clientBuildName = 'client';
export const serverBuildName = 'server';
export const polyfillBuildName = 'polyfill';

export const clientMainFields = ['browser', 'module', 'main'];
export const serverMainFields = ['module', 'main'];

const filters = ignoreWarnings.map(
  ({ message }) =>
    (text: string) =>
      message.test(text)
);

export const stderrWithWarningFilters = new Writable({
  write(chunk, encoding, callback) {
    const chunkStr = chunk.toString();

    if (filters.some((filter) => filter(chunkStr))) {
      callback();
      return;
    }

    process.stderr.write(chunk, encoding, callback);
  },
});

stderrWithWarningFilters.on('error', (error: Error) =>
  console.error('[infrastructureLogging] stream error', error)
);

export function transformMultiToken(configs: any[] | Record<any, any> | null) {
  if (!configs || configs.length === 0) {
    return {};
  }

  if (!Array.isArray(configs)) {
    return configs;
  }

  return configs.reduce((acc, config) => {
    return { ...acc, ...config };
  }, {});
}
