import { resolve, join } from 'path';
import PQueue from 'promise-queue';
import { outputFile } from 'fs-extra';
import type { Context } from '../../models/context';
import type { ConfigManager } from '../../config/configManager';
import type { ApplicationConfigEntry } from '../../typings/configEntry/application';
import { appRequest } from '../../utils/dev-app/request';
import type { Params } from './command';

const MAX_CONCURRENT = 10;
const DYNAMIC_PAGE_REGEX = /\/:.+\//g;

export const generateStatic = async (
  context: Context,
  params: Params,
  configManager: ConfigManager<ApplicationConfigEntry>,
  paths: string[]
) => {
  const { header = [], folder = '' } = params;
  const q = new PQueue(MAX_CONCURRENT);
  const promises = [];
  const headers = header.reduce(
    (result, item) => {
      const [key, value] = item.split(':');

      // eslint-disable-next-line no-param-reassign
      result[key.trim()] = value.trim();

      return result;
    },
    {} as Record<string, string>
  );

  const { rootDir, output } = configManager;
  const staticPath = resolve(rootDir, output.static, folder);

  for (const path of paths) {
    promises.push(
      q.add(async () => {
        // @todo need something similar to https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
        if (DYNAMIC_PAGE_REGEX.test(path)) {
          context.logger.event({
            type: 'warning',
            event: 'COMMAND:STATIC:DYNAMIC_PAGE_UNSUPPORTED',
            message: `path: ${path}, message: export dynamic pages to HTML is not supported`,
          });
          return;
        }

        try {
          context.logger.event({
            type: 'debug',
            event: 'COMMAND:STATIC:PAGE_FETCH',
            message: `path: ${path}, message: start fetching page`,
          });

          const html = await appRequest(configManager, path, { headers });

          await outputFile(join(staticPath, path, 'index.html'), html);

          context.logger.event({
            type: 'debug',
            event: 'COMMAND:STATIC:PAGE_CREATED',
            message: `path: ${path}, message: page created successfully`,
          });
        } catch (e) {
          context.logger.event({
            type: 'error',
            event: 'COMMAND:STATIC:ERROR',
            message: `path: ${path}, message: ${e.message}`,
          });
        }
      })
    );
  }

  return Promise.all(promises);
};
