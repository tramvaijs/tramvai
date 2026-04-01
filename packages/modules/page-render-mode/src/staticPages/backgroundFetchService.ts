import { format } from '@tinkoff/url';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { ENV_MANAGER_TOKEN, LOGGER_TOKEN } from '@tramvai/tokens-common';
import type { STATIC_PAGES_BACKGROUND_FETCH_ENABLED } from '../tokens';

type Logger = ExtractDependencyType<typeof LOGGER_TOKEN>;
type BackgroundCacheEnabled = ExtractDependencyType<typeof STATIC_PAGES_BACKGROUND_FETCH_ENABLED>;

export class BackgroundFetchService {
  private requests = new Set<string>();

  private port: string;
  private hostname: string;
  private log: ReturnType<Logger>;
  private backgroundFetchEnabled: BackgroundCacheEnabled;

  constructor({
    logger,
    envManager,
    backgroundFetchEnabled,
  }: {
    logger: Logger;
    envManager: ExtractDependencyType<typeof ENV_MANAGER_TOKEN>;
    backgroundFetchEnabled: BackgroundCacheEnabled;
  }) {
    this.log = logger('static-pages');
    this.port = envManager.get('PORT')!;
    this.hostname = (envManager.get('HOST') ?? 'localhost').replace('0.0.0.0', 'localhost');
    this.backgroundFetchEnabled = backgroundFetchEnabled;
  }

  enabled() {
    return this.backgroundFetchEnabled();
  }

  async revalidate({
    cacheKey,
    pathname,
    headers,
    query,
  }: {
    cacheKey: string;
    pathname: string;
    headers: Record<string, string | string[] | undefined>;
    query?: Record<string, string | string[]>;
  }) {
    if (this.requests.has(cacheKey)) {
      return;
    }

    // TODO: support --https
    const revalidateUrl = format({
      hostname: this.hostname,
      port: this.port,
      path: pathname,
      query,
    });

    this.requests.add(cacheKey);

    this.log.debug({
      event: 'background-fetch-init',
      cacheKey,
      revalidateUrl,
    });

    return fetch(revalidateUrl, {
      headers: {
        ...headers,
        'X-Tramvai-Static-Page-Revalidate': 'true',
        'X-Tramvai-Service-Name': 'BACKGROUND_STATIC_PAGE_REVALIDATE',
      },
      signal: AbortSignal.timeout(10000),
      // we need to save raw redirect response status code and headers
      redirect: 'manual',
    })
      .then(async (response) => {
        const body = await response.text();
        const { status } = response;

        this.log.debug({
          event: status >= 500 ? 'background-fetch-5xx' : 'background-fetch-success',
          status,
          cacheKey,
        });

        return {
          body,
          // @ts-ignore outdated typings for headers in typescript
          headers: Object.fromEntries(response.headers.entries()),
          status,
        };
      })
      .catch((error) => {
        this.log.warn({
          event: 'background-fetch-error',
          error,
          cacheKey,
        });
      })
      .finally(() => {
        this.requests.delete(cacheKey);
      });
  }
}
