import { createChildApp } from '@tramvai/child-app-core';
import { createAction, provide } from '@tramvai/core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { ROUTER_TOKEN } from '@tramvai/module-router';

import { BaseCmp } from './component';
import { CHILD_APP_BASE_TOKEN } from './tokens';

const notFoundAction = createAction({
  name: 'not-found',
  fn(_context, _payload, deps) {
    return deps.router.navigate({
      code: 404,
    });
  },
  conditions: {
    onlyServer: true,
  },
  deps: {
    router: ROUTER_TOKEN,
  },
});

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'not-found',
  render: BaseCmp,
  modules: [CommonChildAppModule],
  actions: [notFoundAction],
  providers: [
    provide({
      provide: CHILD_APP_BASE_TOKEN,
      useValue: "I'm little child app",
    }),
  ],
});
