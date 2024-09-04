import { createToken } from '@tinkoff/dippy';
import type { Cache } from '@tramvai/tokens-common';

/** Is used to perform all app caches clearing */
export const CACHES_LIST_TOKEN = createToken<Cache[]>('_cachesList');

/** Is used to check the uniqueness of metrics labels */
export const CACHE_NAMES_LIST_TOKEN = createToken<Set<string>>('cache names list');
