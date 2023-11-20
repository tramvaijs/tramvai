import type { FunctionComponent } from 'react';
import { useCallback, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { RouteContext, RouterContext, UrlContext } from '../context';
import type { RouterProviderProps } from './types';

export const DefaultProvider: FunctionComponent<RouterProviderProps> = ({
  router,
  children,
  serverState,
}) => {
  // fallback to outdated router implementation
  const lastRoute = useMemo(() => router.getCurrentRoute(), [router]);
  const lastUrl = useMemo(() => router.getCurrentUrl(), [router]);

  const subscription = useCallback(
    (cb: () => void) => router.registerSyncHook('change', cb),
    [router]
  );

  const route = useSyncExternalStore(
    subscription,
    () => router.getLastRoute?.() ?? lastRoute,
    serverState ? () => serverState.route : () => router.getLastRoute?.() ?? lastRoute
  );

  const url = useSyncExternalStore(
    subscription,
    () => router.getLastUrl?.() ?? lastUrl,
    serverState ? () => serverState.url : () => router.getLastUrl?.() ?? lastUrl
  );

  return (
    <RouterContext.Provider value={router}>
      <RouteContext.Provider value={route}>
        <UrlContext.Provider value={url}>{children}</UrlContext.Provider>
      </RouteContext.Provider>
    </RouterContext.Provider>
  );
};

DefaultProvider.displayName = 'TinkoffRouterProvider';
