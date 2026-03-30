import type { ExtractDependencyType } from '@tinkoff/dippy';
import type {
  ENV_MANAGER_TOKEN,
  LOGGER_TOKEN,
  REQUEST_MANAGER_TOKEN,
  RESPONSE_MANAGER_TOKEN,
} from '@tramvai/tokens-common';
import type { FASTIFY_RESPONSE } from '@tramvai/tokens-server-private';
import type { STATIC_PAGES_BACKGROUND_FETCH_SERVICE } from '../private-tokens';
import type {
  STATIC_PAGES_SHOULD_USE_CACHE,
  StaticPagesCacheEntry,
  STATIC_PAGES_CACHE_TOKEN,
  STATIC_PAGES_MODIFY_CACHE,
  STATIC_PAGES_OPTIONS_TOKEN,
  STATIC_PAGES_CACHE_5xx_RESPONSE,
  STATIC_PAGES_KEY_TOKEN,
  STATIC_PAGES_FS_CACHE_ENABLED,
  STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN,
} from '../tokens';
import type { FileSystemCache } from './fileSystemCache';
import { getCacheKey } from '../utils/cacheKey';

type ResponseManager = ExtractDependencyType<typeof RESPONSE_MANAGER_TOKEN>;
type RequestManager = ExtractDependencyType<typeof REQUEST_MANAGER_TOKEN>;
type Response = ExtractDependencyType<typeof FASTIFY_RESPONSE>;
type Logger = ExtractDependencyType<typeof LOGGER_TOKEN>;
type ShouldUseCache = ExtractDependencyType<typeof STATIC_PAGES_SHOULD_USE_CACHE>;
type BackgroundFetchService = ExtractDependencyType<typeof STATIC_PAGES_BACKGROUND_FETCH_SERVICE>;
type Cache = ExtractDependencyType<typeof STATIC_PAGES_CACHE_TOKEN>;
type ModifyCache = ExtractDependencyType<typeof STATIC_PAGES_MODIFY_CACHE> | null;
type Options = ExtractDependencyType<typeof STATIC_PAGES_OPTIONS_TOKEN>;
type Cache5xxResponse = ExtractDependencyType<typeof STATIC_PAGES_CACHE_5xx_RESPONSE>;
type CacheControlFactory = ExtractDependencyType<typeof STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN>;

// `Location` is required for 3xx responses
const DEFAULT_HEADERS_WHITELIST = ['Location', 'Content-Type', 'Content-Length', 'X-App-Id'];

export class StaticPagesService {
  readonly key: string;
  readonly pathname: string;
  readonly cacheKey: string;
  readonly port: string;

  private responseManager: ResponseManager;
  private requestManager: RequestManager;
  private response: Response;
  private log: ReturnType<Logger>;
  private cache: Cache;
  private fsCache: FileSystemCache | null;
  private fsCacheEnabled: boolean;
  private modifyCache: ModifyCache;
  private backgroundFetchService: BackgroundFetchService;
  private options: Options;
  private cache5xxResponse: Cache5xxResponse;
  private cacheControlFactory: CacheControlFactory;

  public shouldUseCache: () => boolean;

  constructor({
    staticPagesKey,
    requestManager,
    response,
    responseManager,
    environmentManager,
    logger,
    cache,
    fsCache,
    fsCacheEnabled,
    modifyCache,
    shouldUseCache,
    backgroundFetchService,
    options,
    cache5xxResponse,
    cacheControlFactory,
  }: {
    staticPagesKey: ExtractDependencyType<typeof STATIC_PAGES_KEY_TOKEN>;
    requestManager: ExtractDependencyType<typeof REQUEST_MANAGER_TOKEN>;
    responseManager: ResponseManager;
    response: Response;
    environmentManager: ExtractDependencyType<typeof ENV_MANAGER_TOKEN>;
    logger: Logger;
    cache: Cache;
    fsCache: FileSystemCache | null;
    fsCacheEnabled: ExtractDependencyType<typeof STATIC_PAGES_FS_CACHE_ENABLED>;
    modifyCache: ModifyCache;
    shouldUseCache: ShouldUseCache;
    backgroundFetchService: BackgroundFetchService;
    options: Options;
    cache5xxResponse: Cache5xxResponse;
    cacheControlFactory: CacheControlFactory;
  }) {
    this.key = staticPagesKey();
    this.pathname = requestManager.getParsedUrl().pathname;
    this.cacheKey = getCacheKey({ pathname: this.pathname, key: this.key });
    this.port = environmentManager.get('PORT')!;
    this.log = logger('static-pages');
    this.responseManager = responseManager;
    this.requestManager = requestManager;
    this.response = response;
    this.cache = cache;
    this.fsCacheEnabled = fsCacheEnabled();
    this.fsCache = fsCache;
    this.modifyCache = modifyCache;
    this.shouldUseCache = () => shouldUseCache.every((fn) => fn());
    this.backgroundFetchService = backgroundFetchService;
    this.options = options;
    this.cache5xxResponse = cache5xxResponse;
    this.cacheControlFactory = cacheControlFactory;
  }

  // eslint-disable-next-line max-statements
  async respond(onSuccess: () => void) {
    if (!this.hasCache()) {
      this.log.debug({
        event: 'no-cache',
        cacheKey: this.cacheKey,
      });

      setTimeout(() => {
        // async revalidation, response is not delayed
        this.revalidate();
      }, 1).unref();

      return;
    }

    let cacheEntry = await this.getCache();

    if (Array.isArray(this.modifyCache)) {
      cacheEntry = this.modifyCache.reduce((result, modifier) => {
        return modifier(result);
      }, cacheEntry!);
    }

    const { ttl, allowStale } = this.options;
    const { status, headers, body, source, updatedAt } = cacheEntry!;
    const isOutdated = this.cacheOutdated(cacheEntry!);

    if (!this.cache5xxResponse() && status >= 500) {
      this.log.debug({
        event: 'cache-5xx',
        cacheKey: this.cacheKey,
        status,
      });

      setTimeout(() => {
        // it is possible that 5xx response is generated while "tramvai static" command,
        // we can just remove it when `STATIC_PAGES_CACHE_5xx_RESPONSE` is disabled
        // async revalidation, response is not delayed
        this.revalidate();
      }, 1).unref();

      return;
    }

    const isStale = isOutdated && allowStale;

    if (!isOutdated || isStale) {
      this.log.debug({
        event: 'cache-hit',
        cacheKey: this.cacheKey,
        stale: isStale,
      });

      if (isStale) {
        setTimeout(() => {
          // async revalidation, response is not delayed
          this.revalidate();
        }, 1).unref();
      }

      const allowedHeaders: Record<string, string | string[] | undefined> = {};

      this.options.allowedHeaders.concat(DEFAULT_HEADERS_WHITELIST).forEach((header) => {
        const lowercaseHeader = header.toLowerCase();

        if (headers[header]) {
          allowedHeaders[header] = headers[header];
        } else if (headers[lowercaseHeader]) {
          allowedHeaders[lowercaseHeader] = headers[lowercaseHeader];
        }
      });

      this.response
        .headers(allowedHeaders)
        .header('content-type', 'text/html')
        .header('cache-control', this.cacheControlFactory({ ttl, updatedAt }))
        // Vary header is required for correct cache behavior in CDNs and browsers,
        // it indicates that response may vary based on `X-Tramvai-Static-Page-Key` header
        .header('Vary', 'X-Tramvai-Static-Page-Key')
        .header('X-Tramvai-Static-Page-Key', this.key)
        .header('X-Tramvai-Static-Page-From-Cache', 'true')
        .header('X-Tramvai-Static-Page-Cache-Source', source)
        .status(status)
        .send(body);

      onSuccess();
    } else {
      this.log.debug({
        event: 'cache-outdated',
        cacheKey: this.cacheKey,
      });

      setTimeout(() => {
        // async revalidation, response is not delayed
        this.revalidate();
      }, 1).unref();
    }
  }

  async revalidate() {
    if (!this.backgroundFetchService.enabled()) {
      return;
    }

    if (this.hasCache()) {
      const cacheEntry = await this.getCache();
      const isOutdated = this.cacheOutdated(cacheEntry!);

      if (!isOutdated) {
        return;
      }
    }

    const incomingHeaders = this.requestManager.getHeaders();
    const revalidateHeaders: Record<string, string | string[] | undefined> = {};

    this.options.allowedHeaders.concat(DEFAULT_HEADERS_WHITELIST).forEach((header) => {
      const lowercaseHeader = header.toLowerCase();

      if (incomingHeaders[header]) {
        revalidateHeaders[header] = incomingHeaders[header];
      } else if (incomingHeaders[lowercaseHeader]) {
        revalidateHeaders[lowercaseHeader] = incomingHeaders[lowercaseHeader];
      }
    });

    await this.backgroundFetchService
      .revalidate({
        cacheKey: this.cacheKey,
        pathname: this.pathname,
        headers: revalidateHeaders,
      })
      .then((response) => {
        if (!response) {
          return;
        }
        if (!this.cache5xxResponse() && response.status >= 500) {
          this.log.debug({
            event: 'cache-set-5xx',
            cacheKey: this.cacheKey,
          });
          return;
        }
        // for 4xx responses we want to cache only HTML pages
        if (
          response.status >= 400 &&
          response.status < 500 &&
          !response.headers['content-type']?.includes('text/html')
        ) {
          this.log.debug({
            event: 'cache-set-4xx',
            cacheKey: this.cacheKey,
          });
          return;
        }

        const cachedHeaders: Record<string, string | string[]> = {};
        const responseHeaders = response.headers;

        this.options.allowedHeaders.concat(DEFAULT_HEADERS_WHITELIST).forEach((header) => {
          const lowercaseHeader = header.toLowerCase();

          if (responseHeaders[header]) {
            cachedHeaders[header] = responseHeaders[header];
          } else if (responseHeaders[lowercaseHeader]) {
            cachedHeaders[lowercaseHeader] = responseHeaders[lowercaseHeader];
          }
        });

        return this.setCache({ ...response, headers: cachedHeaders });
      });
  }

  private hasCache() {
    let result = this.cache.has(this.cacheKey);

    if (!result && this.fsCacheEnabled) {
      result = this.fsCache!.has(this.cacheKey);
    }

    return result;
  }

  private async getCache() {
    let result = this.cache.get(this.cacheKey);

    // update item recency in FS-cache
    if (result && this.fsCacheEnabled) {
      this.fsCache!.moveToHead(this.cacheKey);
    }

    if (!result && this.fsCacheEnabled) {
      result = await this.fsCache!.get(this.cacheKey);

      // always fill memory cache
      if (result) {
        this.cache.set(this.cacheKey, { ...result, source: 'memory' });
      }
    }

    return result;
  }

  private async setCache(cacheEntry: Omit<StaticPagesCacheEntry, 'updatedAt' | 'source'>) {
    this.log.debug({
      event: 'cache-set',
      cacheKey: this.cacheKey,
    });

    const entry = {
      ...cacheEntry,
      updatedAt: Date.now(),
    };

    this.cache.set(this.cacheKey, { ...entry, source: 'memory' });

    if (this.fsCacheEnabled) {
      await this.fsCache!.set(this.cacheKey, { ...entry, source: 'fs' });
    }
  }

  private cacheOutdated(cacheEntry: StaticPagesCacheEntry): boolean {
    const { ttl } = this.options;
    const { updatedAt } = cacheEntry;

    const isOutdated = updatedAt + ttl <= Date.now();

    return isOutdated;
  }
}
