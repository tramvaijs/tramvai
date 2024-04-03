import { createApi } from '@tramvai/tools-migrate/lib/testUtils';

import migration from './1-react-query-creating';

describe('migrations/packages/tramvai/react-query/1-react-query-creating', () => {
  const api = createApi({
    packageJSON: { source: {}, path: '/package.json' },
    tramvaiJSON: { source: {}, path: '/tramvai.json' },
    transformTests: {
      // createQuery
      'does nothing': {
        input: {
          source: `const a = 5; function createQuery() {}; createQuery({});`,
        },
        output: {},
      },
      'does nothing if createQuery exported by default': {
        input: {
          source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export default createQuery({
              key: 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createQuery have serializable key as string': {
        input: {
          source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const query = createQuery({
              key: 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createQuery have serializable key as array': {
        input: {
          source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const query = createQuery({
              key: ['base'],
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createQuery have serializable key and have actionNamePostfix': {
        input: {
          source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createQuery({
              key: 'base',
              actionNamePostfix: 'someNewQuery',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createQuery have non-serializable key and have actionNamePostfix': {
        input: {
          source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createQuery({
              key: () => 'base',
              actionNamePostfix: 'someNewQuery',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'adds actionNamePostfix if createQuery have non-serializable key, takes variable name (named import)':
        {
          input: {
            source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createQuery have non-serializable key as method, takes variable name (named import)':
        {
          input: {
            source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createQuery({
              key() { return 'base'; },
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createQuery({
              key() { return 'base'; },

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createQuery have non-serializable key, takes variable name (renamed import)':
        {
          input: {
            source: `
            import { createQuery as createTramvaiQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createTramvaiQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createQuery as createTramvaiQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createTramvaiQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createQuery have non-serializable key, takes variable name (full import)':
        {
          input: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = tramvaiQuery.createQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = tramvaiQuery.createQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createQuery have non-serializable key, takes variable name (full import) and own createQuery':
        {
          input: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            function createQuery() {};
            createQuery({ key: () => 'base' });

            export const someQuery = tramvaiQuery.createQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            function createQuery() {};
            createQuery({ key: () => 'base' });

            export const someQuery = tramvaiQuery.createQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      // createInfiniteQuery
      'does nothing (createInfiniteQuery)': {
        input: {
          source: `const a = 5; function createInfiniteQuery() {}; createInfiniteQuery({});`,
        },
        output: {},
      },
      'does nothing if createInfiniteQuery exported by default': {
        input: {
          source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export default createInfiniteQuery({
              key: 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createInfiniteQuery have serializable key as string': {
        input: {
          source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const query = createInfiniteQuery({
              key: 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createInfiniteQuery have serializable key as array': {
        input: {
          source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const query = createInfiniteQuery({
              key: ['base'],
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createInfiniteQuery have serializable key and have actionNamePostfix': {
        input: {
          source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key: 'base',
              actionNamePostfix: 'someNewQuery',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'does nothing if createInfiniteQuery have non-serializable key and have actionNamePostfix': {
        input: {
          source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key: () => 'base',
              actionNamePostfix: 'someNewQuery',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
        },
        output: {},
      },
      'adds actionNamePostfix if createInfiniteQuery have non-serializable key, takes variable name (named import)':
        {
          input: {
            source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createInfiniteQuery have non-serializable key as method, takes variable name (named import)':
        {
          input: {
            source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key() { return 'base'; },
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createInfiniteQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key() { return 'base'; },

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createInfiniteQuery have non-serializable key, takes variable name (renamed import)':
        {
          input: {
            source: `
            import { createInfiniteQuery as createTramvaiQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createTramvaiQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createInfiniteQuery as createTramvaiQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createTramvaiQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createInfiniteQuery have non-serializable key, takes variable name (full import)':
        {
          input: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = tramvaiQuery.createInfiniteQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = tramvaiQuery.createInfiniteQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createInfiniteQuery have non-serializable key, takes variable name (full import) and own createInfiniteQuery':
        {
          input: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            function createInfiniteQuery() {};
            createInfiniteQuery({ key: () => 'base' });

            export const someQuery = tramvaiQuery.createInfiniteQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            function createInfiniteQuery() {};
            createInfiniteQuery({ key: () => 'base' });

            export const someQuery = tramvaiQuery.createInfiniteQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });
          `,
          },
        },
      // Together createQuery and createInfiniteQuery
      'adds actionNamePostfix if createInfiniteQuery/createQuery have non-serializable key, takes variable name (named import)':
        {
          input: {
            source: `
            import { createInfiniteQuery, createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });

            export const someAnotherQuery = createInfiniteQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import { createInfiniteQuery, createQuery } from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            export const someQuery = createInfiniteQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });

            export const someAnotherQuery = createInfiniteQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someAnotherQuery'
            });
          `,
          },
        },
      'adds actionNamePostfix if createInfiniteQuery/createQuery have non-serializable key, takes variable name (full import) and own createQuery/createInfiniteQuery':
        {
          input: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            function createInfiniteQuery() {};
            createInfiniteQuery({ key: () => 'base' });

            function createQuery() {};
            createQuery({ key: () => 'base' });

            export const someQuery = tramvaiQuery.createInfiniteQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });

            export const someAnotherQuery = tramvaiQuery.createQuery({
              key: () => 'base',
              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },
              deps: {
                httpClient: HTTP_CLIENT,
              },
            });
          `,
          },
          output: {
            source: `
            import tramvaiQuery from '@tramvai/react-query';
            import { HTTP_CLIENT } from '@tramvai/tokens-http-client';

            function createInfiniteQuery() {};
            createInfiniteQuery({ key: () => 'base' });

            function createQuery() {};
            createQuery({ key: () => 'base' });

            export const someQuery = tramvaiQuery.createInfiniteQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someQuery'
            });

            export const someAnotherQuery = tramvaiQuery.createQuery({
              key: () => 'base',

              fn: async (_, { apiClient }) => {
                const { payload } = await apiClient.get<string>('api/example');

                return payload;
              },

              deps: {
                httpClient: HTTP_CLIENT,
              },

              actionNamePostfix: 'someAnotherQuery'
            });
          `,
          },
        },
    },
  });

  beforeAll(async () => {
    await migration(api);
  });
});
