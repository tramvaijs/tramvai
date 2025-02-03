import each from '@tinkoff/utils/array/each';
import path from '@tinkoff/utils/object/path';
import type { PageResource } from '@tramvai/tokens-render';
import { ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { PRELOAD_JS } from '../../constants/performance';
import { onload } from './onload.inline';
import type { JsPreloadResource } from './types';

export const addPreloadForCriticalJS = (pageResources: PageResource[]): PageResource => {
  const jsResources: JsPreloadResource[] = [];

  each((res) => {
    if (res.type === 'script' && path(['attrs', 'data-critical'], res)) {
      jsResources.push({
        url: res.payload,
        integrity: res.attrs.integrity,
      });
    }
  }, pageResources);

  return {
    type: ResourceType.inlineScript,
    slot: ResourceSlot.HEAD_PERFORMANCE,
    payload: `window.${PRELOAD_JS}=(${onload})(${JSON.stringify(jsResources)})`,
  };
};
