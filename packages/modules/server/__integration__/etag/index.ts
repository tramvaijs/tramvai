import { createApp, provide } from '@tramvai/core';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import { ENV_MANAGER_TOKEN, ENV_USED_TOKEN } from '@tramvai/tokens-common';
import { ETAG_OPTIONS_TOKEN } from '@tramvai/tokens-server';

createApp({
  name: 'etag-app',
  modules: [...modules],
  bundles,
  providers: [
    provide({
      provide: ETAG_OPTIONS_TOKEN,
      useFactory: ({ envManager }) => ({
        enabled: true,
        weak: envManager.get('WEAK_ETAG') === 'true',
      }),
      deps: {
        envManager: ENV_MANAGER_TOKEN,
      },
    }),
    provide({
      provide: ENV_USED_TOKEN,
      useValue: [
        {
          key: 'WEAK_ETAG',
          optional: true,
        },
      ],
    }),
  ],
});
