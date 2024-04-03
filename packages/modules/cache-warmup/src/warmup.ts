import type { PAPI_SERVICE } from '@tramvai/tokens-http-client';
import type { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/module-common';
import { createRequestsOptions, sendWarmUpRequest, queueRequests } from './utils';

const userAgents = [
  /** Chrome on Mac OS */
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
  /**  Chrome on Mobile */
  'Mozilla/5.0 (Linux; Android 12.0; Pixel 5 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3904.108 Mobile Safari/537.36',
];

export async function warmUpCache(options: {
  papiService: typeof PAPI_SERVICE;
  logger: typeof LOGGER_TOKEN;
  environmentManager: typeof ENV_MANAGER_TOKEN;
}) {
  const { papiService, logger, environmentManager } = options;
  const log = logger('cache-warmup');
  const startTimestamp = Date.now();

  log.info("Cache warmup process 'START'");

  try {
    const { payload: urls } = await papiService.request<string[]>({
      path: 'bundleInfo',
    });

    const requestsOptions = createRequestsOptions({
      urls,
      port: environmentManager.get('PORT')!,
      userAgents,
    });

    const results = await queueRequests({
      makeRequest: sendWarmUpRequest,
      requestsOptions,
      maxSimultaneous: 1,
    });

    const failed = results.filter((result) => result.result === 'rejected');

    if (failed.length) {
      log.info(
        `Cache warmup process 'FINISHED' with errors, failed URLs:\n${failed
          .map((v) => v.option.path)
          .join('\n')}`
      );
    } else {
      log.info("Cache warmup process 'SUCCESS'");
    }

    log.info(`Cache warmup  made ${results.length} requests for ${urls.length} URLs`);
    log.info(`Cache warmup took - ${Date.now() - startTimestamp}ms`);
  } catch (error: any) {
    log.error(error, "Cache warmup process 'FAILURE'");
  }
}
