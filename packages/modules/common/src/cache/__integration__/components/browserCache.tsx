import React, { useDi } from '@tramvai/react';
import { useCallback, useEffect, useState } from 'react';
import { CLEAR_CACHE_TOKEN } from '@tramvai/tokens-common';
import { TEST_CACHES_TOKEN } from '../tokens';

export function BrowserCache() {
  const { caches, clearCache } = useDi({
    caches: TEST_CACHES_TOKEN,
    clearCache: CLEAR_CACHE_TOKEN,
  });

  const [text, setText] = useState('');

  useEffect(() => {
    caches['cache-name-lru'].set('a', 'hello');
    caches['cache-name-lfu'].set('b', 'world');

    const a = caches['cache-name-lru'].get('a');
    const b = caches['cache-name-lfu'].get('b');

    setText(`${a} ${b}`);
  }, [caches]);

  const handleCacheClear = useCallback(() => {
    clearCache();

    const a = caches['cache-name-lru'].get('a');
    const b = caches['cache-name-lfu'].get('b');

    if (!a && !b) {
      setText('cache cleared');
    }
  }, [caches, clearCache]);

  return (
    <div>
      <code data-testid="text-cache">{text}</code>
      <hr />
      <button type="button" data-testid="clear-cache" onClick={handleCacheClear}>
        clear all caches
      </button>
    </div>
  );
}
