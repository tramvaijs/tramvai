import type { ComponentType } from 'react';
import { createToken, Scope } from '@tinkoff/dippy';
import type { TramvaiRenderMode } from '@tramvai/tokens-render';
import type { Cache, ResponseManager } from '@tramvai/tokens-common';
import type { commandLineListTokens } from '@tramvai/tokens-core';
import { RouteTree } from '@tinkoff/router';
import { StaticPagesService } from './staticPages/staticPagesService';

export const PAGE_RENDER_FALLBACK_COMPONENT_PREFIX = createToken<string>(
  'pageRenderFallbackComponentName'
);

/**
 * @deprecated Use token `TRAMVAI_RENDER_MODE` from `@tramvai/tokens-render`
 */
export const PAGE_RENDER_DEFAULT_MODE = createToken<TramvaiRenderMode | (() => TramvaiRenderMode)>(
  'pageRenderDefaultMode'
);

export const PAGE_RENDER_WRAPPER_TYPE = createToken<'layout' | 'content' | 'page'>(
  'pageRenderWrapperType'
);

export const PAGE_RENDER_DEFAULT_FALLBACK_COMPONENT = createToken<ComponentType<any>>(
  'pageRenderDefaultFallbackComponent',
  { scope: Scope.SINGLETON }
);

export interface StaticPagesCacheEntry {
  updatedAt: number;
  headers: ReturnType<ResponseManager['getHeaders']>;
  status: ReturnType<ResponseManager['getStatus']>;
  body: string;
  source: 'memory' | 'fs';
}

export interface StaticPagesOptions {
  /**
   * Static page cache live time in milliseconds
   * @default 300000
   */
  ttl: number;
  /**
   * Cached static page maximum size in memory
   * @default 100
   */
  maxSize: number;
  /**
   * Whether to allow stale entries to be returned
   * @default true
   */
  allowStale: boolean;
  /**
   * Whitelist of headers, that are allowed to be passed from client request to backround cache revalidation request,
   * and allowed to be cached and returned with the cached response
   * @default []
   */
  allowedHeaders: string[];
}

export const STATIC_PAGES_CACHE_TOKEN =
  createToken<Cache<StaticPagesCacheEntry>>('static pages cache');

export const STATIC_PAGES_SHOULD_USE_CACHE = createToken<() => boolean>(
  'static pages should use cache',
  { multi: true }
);

export const STATIC_PAGES_BACKGROUND_FETCH_ENABLED = createToken<() => boolean>(
  'static pages can fetch page'
);

export const STATIC_PAGES_OPTIONS_TOKEN = createToken<StaticPagesOptions>('static pages options');

export const STATIC_PAGES_COMMAND_LINE = createToken<keyof typeof commandLineListTokens>(
  'static pages command line'
);

export const STATIC_PAGES_MODIFY_CACHE = createToken<
  (entry: StaticPagesCacheEntry) => StaticPagesCacheEntry
>('static pages modify cache', { multi: true });

export const STATIC_PAGES_CACHE_5xx_RESPONSE = createToken<() => boolean>(
  'static pages cache 5xx response'
);

/**
 * Token that computes the current cache key for a page variation
 * For example: 'mobile', 'desktop', or empty string for default variation
 * Used in combination with pathname to create the full cache key
 */
export const STATIC_PAGES_KEY_TOKEN = createToken<() => string>('static pages key', {
  scope: Scope.REQUEST,
});

export interface FileSystemCacheOptions {
  /**
   * Directory where static HTML files are stored
   * @default 'dist/static'
   */
  directory: string;
  /**
   * Maximum number of files to keep in cache
   * @default 1000
   */
  maxSize: number;
  /**
   * TTL for cache entries in milliseconds
   * @default 300000
   */
  ttl: number;
  /**
   * Whether to allow stale entries to be returned
   * @default true
   */
  allowStale: boolean;
}

export const STATIC_PAGES_FS_CACHE_ENABLED = createToken<() => boolean>(
  'static pages file system cache enabled',
  { scope: Scope.SINGLETON }
);

export const STATIC_PAGES_FS_CACHE_OPTIONS_TOKEN = createToken<FileSystemCacheOptions>(
  'static pages file system cache options',
  { scope: Scope.SINGLETON }
);

export const STATIC_PAGES_CACHE_CONTROL_HEADER_TOKEN = createToken<
  (entry: { ttl: number; updatedAt: number }) => string
>('static pages cache-control header', {
  scope: Scope.REQUEST,
});

export const STATIC_PAGES_SERVICE = createToken<StaticPagesService>('static pages service');

export const STATIC_PAGES_ROUTE_TREE = createToken<RouteTree>('static pages route tree', {
  scope: Scope.SINGLETON,
});
