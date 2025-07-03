import { createApi } from '@tramvai/tools-migrate/lib/testUtils';

import migration from './d2025-05-30b-view-transitions-provider-expansion';

describe('migrations/packages/modules/router/view-transitions-provider-expansion', () => {
  const api = createApi({
    packageJSON: { source: {}, path: '/package.json' },
    tramvaiJSON: {
      source: { projects: { test: { name: 'test', experiments: { viewTransitions: true } } } },
      path: '/tramvai.json',
    },
    transformTests: {
      'no changes': {
        input: {
          source: `
import {
  ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
  ROUTER_VIEW_TRANSITIONS_ENABLED,
} from '@tramvai/module-router';

createApp({
  name: 'projectName',
  modules: [],
  providers: [
    provide({
      provide: ROUTER_VIEW_TRANSITIONS_ENABLED,
      useValue: true,
    }),
    provide({
      provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      useValue: 'before',
    })
  ],
 }
)
`,
        },
        output: { source: undefined },
      },
      'add new provider with token import': {
        input: {
          source: `
import {
  ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
} from '@tramvai/module-router';

createApp({
  name: 'projectName',
  modules: [],
  providers: [
    provide({
      provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
      useValue: 'before',
    })
  ],
 }
)
`,
        },
        output: {
          source: `
import { ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN, ROUTER_VIEW_TRANSITIONS_ENABLED } from '@tramvai/module-router';

createApp({
  name: 'projectName',
  modules: [],
  providers: [provide({
    provide: ROUTER_SPA_ACTIONS_RUN_MODE_TOKEN,
    useValue: 'before',
  }), provide({
    provide: ROUTER_VIEW_TRANSITIONS_ENABLED,
    useValue: true
  })],
 }
)
`,
        },
      },
    },
  });

  beforeAll(async () => {
    await migration(api);
  });
});
