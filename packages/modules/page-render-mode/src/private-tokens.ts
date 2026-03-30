import type { Counter, Gauge } from 'prom-client';
import { createToken } from '@tramvai/core';
import { TramvaiRenderMode } from '@tramvai/tokens-render';
import { Route } from '@tinkoff/router';
import { BackgroundFetchService } from './staticPages/backgroundFetchService';
import { StaticPagesService } from './staticPages/staticPagesService';
import { FileSystemCache } from './staticPages/fileSystemCache';

export const STATIC_PAGES_BACKGROUND_FETCH_SERVICE = createToken<BackgroundFetchService>();

export const STATIC_PAGES_CACHE_METRICS_TOKEN = createToken<{
  hit: Counter<any>;
}>();

export const STATIC_PAGES_FS_CACHE_TOKEN = createToken<FileSystemCache | null>();

export const STATIC_PAGES_FS_CACHE_METRICS_TOKEN = createToken<{
  hit: Counter<any>;
  miss: Counter<any>;
  size: Gauge<any>;
  bytes: Gauge<any>;
}>();

export const STATIC_PAGES_RESOLVE_PAGE_RENDER_MODE =
  createToken<(route?: Route) => TramvaiRenderMode>();
