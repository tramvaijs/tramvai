import { useStore } from '@tramvai/state';
import { RouterStore, useRoute } from '@tramvai/module-router';

import { markDesyncRender } from './marks';

// reads the router store directly only to detect renders, where it is out of sync with `useRoute`
export function RouterStoreProbe() {
  const route = useRoute();
  const { currentRoute } = useStore(RouterStore);

  if (currentRoute && currentRoute.actualPath !== route.actualPath) {
    markDesyncRender();
  }

  return null;
}
