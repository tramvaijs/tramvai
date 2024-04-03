import { createApi } from '@tramvai/tools-migrate/lib/testUtils';

import migration from './1-als-rename-module';

describe('migrations/common/als-rename-module', () => {
  describe('packageJSON have @tramvai-tinkoff/module-async-local-storage', () => {
    const api = createApi({
      packageJSON: {
        source: {
          dependencies: {
            '@tramvai/module-common': '2.1.0',
            '@tramvai-tinkoff/module-async-local-storage': '2.1.0',
          },
        },
      },
      transformTests: {
        'do nothing': {
          input: {
            source: `const a = 5;`,
          },
          output: {},
        },
        'replace als package name': {
          input: {
            source: `import { AsyncLocalStorageModule } from '@tramvai-tinkoff/module-async-local-storage';`,
          },
          output: {
            source: `import { AsyncLocalStorageModule } from '@tramvai/module-common';`,
          },
        },
      },
    });

    migration(api);

    it('test package json', () => {
      expect(api.packageJSON.source).toEqual({
        dependencies: {
          '@tramvai/module-common': '2.1.0',
        },
      });
    });
  });
});
