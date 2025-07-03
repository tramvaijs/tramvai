import { createApi } from '@tramvai/tools-migrate/lib/testUtils';

import migration from './d2025-05-29b-view-transitions-hook-expansion';

describe('migrations/packages/modules/router/view-transitions-hook-expansion', () => {
  const api = createApi({
    packageJSON: { source: {}, path: '/package.json' },
    tramvaiJSON: { source: {}, path: '/tramvai.json' },
    transformTests: {
      'no changes': {
        input: {
          source: `
import { useViewTransition } from '@tinkoff/router';

const  { isTransitioning } = useViewTransition(url);
`,
        },
        output: { source: undefined },
      },
      'replace incorrect variable declaration': {
        input: {
          source: `
import { useViewTransition } from '@tinkoff/router';

const variable = useViewTransition(url);
`,
        },
        output: {
          source: `
import { useViewTransition } from '@tinkoff/router';

const {
  isTransitioning: variable
} = useViewTransition(url);
`,
        },
      },
    },
  });

  beforeAll(async () => {
    await migration(api);
  });
});
