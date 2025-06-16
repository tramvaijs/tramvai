import module from 'node:module';
import findCacheDir from 'find-cache-dir';

if (process.env.TRAMVAI_COMPILE_CACHE_DISABLED !== 'true') {
  const cacheDir = findCacheDir({ cwd: process.cwd(), create: true, name: 'node-compile-cache' });
  // @ts-expect-error
  module.enableCompileCache?.(cacheDir);
}
