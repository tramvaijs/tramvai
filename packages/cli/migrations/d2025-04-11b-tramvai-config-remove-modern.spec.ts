import { createApi } from '@tramvai/tools-migrate/lib/testUtils';

import migration from './d2025-04-11b-tramvai-config-remove-modern';

describe('migrations/packages/cli/d2025-04-11b-tramvai-config-remove-modern', () => {
  const api = createApi({
    tramvaiJSON: {
      source: {
        projects: {
          invest: {
            name: 'invest',
            root: 'src',
            type: 'application',
            polyfill: './polyfill.ts',
            modern: true,
          },
        },
      },
      path: '/tramvai.json',
    },
  });

  it('should remove modern field', async () => {
    await migration(api);

    expect(JSON.stringify(api.tramvaiJSON.source, null, 2)).toMatchInlineSnapshot(`
      "{
        "projects": {
          "invest": {
            "name": "invest",
            "root": "src",
            "type": "application",
            "polyfill": "./polyfill.ts"
          }
        }
      }"
    `);
  });
});
