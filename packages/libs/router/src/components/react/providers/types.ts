import type { Url } from '@tinkoff/url';
import type { PropsWithChildren } from 'react';

import type { NavigationRoute } from '../../../types';
import type { AbstractRouter } from '../../../router/abstract';

export interface RouterState {
  route: NavigationRoute;
  url: Url;
}

export interface RouterProviderProps extends PropsWithChildren {
  router: AbstractRouter;
  serverState?: { route: NavigationRoute; url: Url };
}
