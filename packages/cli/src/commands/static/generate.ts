import { resolve, join } from 'path';
import PQueue from 'promise-queue';
import { outputFile } from 'fs-extra';
import { getHeaders } from '@tinkoff/request-plugin-protocol-http';
import type { Context } from '../../models/context';
import type { ConfigManager } from '../../config/configManager';
import type { ApplicationConfigEntry } from '../../typings/configEntry/application';
import { appRequest } from '../../utils/dev-app/request';
import type { Params } from './command';

const MAX_CONCURRENT = 10;

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
    {
      'x-tramvai-prerender': 'true',
    } as Record<string, string>
  );

  const { rootDir, output } = configManager;
  const staticPath = resolve(rootDir, output.static, folder);

  for (const path of paths) {
    promises.push(
      q.add(async () => {
        let response: any;

        try {
          context.logger.event({
            type: 'debug',
            event: 'COMMAND:STATIC:PAGE_FETCH',
            message: `path: ${path}, message: start fetching page`,
          });

          response = appRequest(configManager, path, { headers });
          const html = await response;

          await outputFile(join(staticPath, path, 'index.html'), html);

          context.logger.event({
            type: 'debug',
            event: 'COMMAND:STATIC:PAGE_CREATED',
            message: `path: ${path}, message: page created successfully`,
          });
        } catch (e) {
          const responseHeaders = response ? getHeaders(response) : {};

          if (responseHeaders['x-tramvai-prerender-skip'] === 'true') {
            context.logger.event({
              type: 'debug',
              event: 'COMMAND:STATIC:PAGE_SKIP',
              message: `path: ${path}, message: page prerender skipped`,
            });

            return;
          }

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
