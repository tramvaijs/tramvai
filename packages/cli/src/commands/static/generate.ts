import { resolve, join } from 'path';
import PQueue from 'promise-queue';
import { outputFile } from 'fs-extra';
import { getHeader, getHeaders, getStatus } from '@tinkoff/request-plugin-protocol-http';
import type { Context } from '../../models/context';
import type { ConfigManager } from '../../config/configManager';
import type { ApplicationConfigEntry } from '../../typings/configEntry/application';
import { appFetch } from '../../utils/dev-app/request';
import type { Params } from './command';

const MAX_CONCURRENT = 10;

export interface PrerenderRequest {
  /**
   * Page path, for example, '/product/123/', without query parameters
   */
  pathname: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export const generateStatic = async (
  context: Context,
  params: Params,
  configManager: ConfigManager<ApplicationConfigEntry>,
  paths: Array<string | PrerenderRequest>
) => {
  const meta: {
    staticPages: Record<string, any>[];
  } = {
    staticPages: [],
  };
  const { header = [], folder = '' } = params;
  const q = new PQueue(MAX_CONCURRENT);
  const promises = [];
  const baseHeaders = header.reduce(
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

  for (const pathOrRequest of paths) {
    promises.push(
      // eslint-disable-next-line max-statements
      q.add(async () => {
        let response: Response;

        const request: PrerenderRequest =
          typeof pathOrRequest === 'string' ? { pathname: pathOrRequest } : pathOrRequest;

        const { pathname, headers: requestHeaders = {}, query = {} } = request;

        const mergedHeaders = {
          ...baseHeaders,
          ...requestHeaders,
        };

        try {
          context.logger.event({
            type: 'debug',
            event: 'COMMAND:STATIC:PAGE_FETCH',
            message: `path: ${pathname}, message: start fetching page`,
            payload: {
              headers: mergedHeaders,
              query,
            },
          });

          response = await appFetch(configManager, pathname, {
            query,
            headers: mergedHeaders,
            // we need to save raw redirect response status code and headers
            redirect: 'manual',
          });

          if (response?.headers?.get('x-tramvai-prerender-skip') === 'true') {
            context.logger.event({
              type: 'debug',
              event: 'COMMAND:STATIC:PAGE_SKIP',
              message: `path: ${pathname}, message: page prerender skipped`,
              payload: {
                headers: mergedHeaders,
                query,
              },
            });

            return;
          }

          const keyHeader = response.headers.get('x-tramvai-static-page-key');
          const routeHeader = response.headers.get('x-tramvai-static-page-route');
          const filename = keyHeader ? `index.${keyHeader}.html` : 'index.html';
          const metaFilename = keyHeader ? `index.${keyHeader}.json` : 'index.json';
          const outputPath = join(staticPath, pathname, filename);
          const metaOutputPath = join(staticPath, pathname, metaFilename);

          if (typeof routeHeader === 'string') {
            const route = JSON.parse(routeHeader);

            if (
              !meta.staticPages.some((item) => item.name === route.name || item.path === route.path)
            ) {
              meta.staticPages.push(route);
            }
          }

          await outputFile(outputPath, await response.text());
          await outputFile(
            metaOutputPath,
            JSON.stringify(
              {
                // @ts-expect-error
                headers: Object.fromEntries(response.headers),
                status: response.status,
              },
              null,
              2
            )
          );

          context.logger.event({
            type: 'debug',
            event: 'COMMAND:STATIC:PAGE_CREATED',
            message: `path: ${pathname}${keyHeader ? `, key: ${keyHeader}` : ''}, message: page created successfully at ${outputPath}`,
            payload: {
              headers: mergedHeaders,
              query,
            },
          });
        } catch (e) {
          context.logger.event({
            type: 'error',
            event: 'COMMAND:STATIC:ERROR',
            message: `path: ${pathname}, message: ${e.message}`,
            payload: {
              headers: mergedHeaders,
              query,
            },
          });
        }
      })
    );
  }

  return Promise.all(promises).then(() => {
    return outputFile(join(staticPath, 'meta.json'), JSON.stringify(meta, null, 2));
  });
};
