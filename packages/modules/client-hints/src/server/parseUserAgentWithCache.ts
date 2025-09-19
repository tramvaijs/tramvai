import type { Cache } from '@tramvai/tokens-common';
import type { UAParserExtensionsTypes, UserAgent } from '@tinkoff/user-agent';
import { parse } from '@tinkoff/user-agent';

export const parseUserAgentWithCache = (
  cache: Cache,
  userAgent: string,
  metrics: { hit: Function; miss: Function },
  extensions?: UAParserExtensionsTypes[] | null
): UserAgent => {
  if (cache.has(userAgent)) {
    metrics.hit();
    return cache.get(userAgent);
  }
  metrics.miss();
  const result = parse(userAgent, extensions);
  cache.set(userAgent, result);

  return result;
};
