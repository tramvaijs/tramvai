import type { PAPI_SERVICE } from '@tramvai/tokens-http-client';
import type { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import { ExtractDependencyType } from '@tramvai/core';
import { createRequestsOptions, sendWarmUpRequest, queueRequests } from './utils';
import { CACHE_WARMUP_HOOKS_TOKEN } from './tokens';

const userAgents = [
  /** Chrome on Mac OS */
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
  /**  Chrome on Mobile */
  'Mozilla/5.0 (Linux; Android 12.0; Pixel 5 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3904.108 Mobile Safari/537.36',
];

export const deduplicateArray = <T>(list: T[]): T[] => {
  return Array.from(new Set(list));
};

export async function warmUpCache(options: {
  papiService: ExtractDependencyType<typeof PAPI_SERVICE>;
  logger: ExtractDependencyType<typeof LOGGER_TOKEN>;
  environmentManager: ExtractDependencyType<typeof ENV_MANAGER_TOKEN>;
  hooks: ExtractDependencyType<typeof CACHE_WARMUP_HOOKS_TOKEN>;
}) {
  const { papiService, logger, environmentManager, hooks } = options;
  const log = logger('cache-warmup');
  const startTimestamp = Date.now();

  log.info("Cache warmup process 'START'");

  try {
    const { payload: urls } = await papiService.request<string[]>({
      path: 'prerenderRoutes',
    });

    const requestsOptions = createRequestsOptions({
      urls,
      port: environmentManager.get('PORT')!,
      userAgents,
    });

    log.info(
      `Cache warmup URLs:\n${deduplicateArray(requestsOptions.map((v) => v.url)).join('\n')}`
    );

    const results = await queueRequests({
      makeRequest: sendWarmUpRequest,
      requestsOptions,
      maxSimultaneous: 1,
      hooks,
    });

    const failed = results.filter((result) => result.result === 'rejected');
    const skipped = results.filter((result) => result.result === 'skipped');

    if (failed.length) {
      log.info(
        `Cache warmup process 'FINISHED' with errors, failed URLs:\n${failed
          .map((v) => v.parameters.url)
          .join('\n')}`
      );
    } else if (skipped.length) {
      log.info(
        `Cache warmup process 'SUCCESS', skipped URLs:\n${skipped
          .map((v) => v.parameters.url)
          .join('\n')}`
      );
    } else {
      log.info("Cache warmup process 'SUCCESS'");
    }

    log.info(
      `Cache warmup made ${results.length - skipped.length} requests for ${urls.length} URLs`
    );
    log.info(`Cache warmup took - ${Date.now() - startTimestamp}ms`);
  } catch (error: any) {
    log.error(error, "Cache warmup process 'FAILURE'");
  }
}
