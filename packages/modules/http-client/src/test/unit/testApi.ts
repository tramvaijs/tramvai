import type { Cache } from '@tramvai/tokens-common';
import { getDiWrapper } from '@tramvai/test-helpers';
import { CommonTestModule } from '@tramvai/test-mocks';
import type { createMockEnvManager } from '@tramvai/test-mocks';
import { HttpClientModule } from '../../httpClientModule';
import { jest } from '@jest/globals';
import type { Mock } from 'jest-mock';

const fetch = jest.spyOn(require('undici'), 'fetch');

type Options = Parameters<typeof getDiWrapper>[0] & {
  env?: Parameters<typeof createMockEnvManager>[0];
};

export const testApi = (options: Options) => {
  const caches: Cache[] = [];
  const { modules = [], providers = [], env } = options;

  const { di } = getDiWrapper({
    di: options.di,
    modules: [
      CommonTestModule.forRoot({
        env,
        onCacheCreated: (cache: Cache) => {
          caches.push(cache);
        },
      }),
      HttpClientModule,
      ...modules,
    ],
    providers: [...providers],
  });

  const fetchMock: Mock = fetch as any;

  const clearCaches = () => {
    caches.forEach((cache) => cache.clear());
  };

  return {
    di,
    fetchMock,
    mockJsonResponse: async (
      body: Record<string, any>,
      { status, headers }: { status?: number; headers?: Record<string, string> } = {}
    ) => {
      clearCaches();

      fetchMock.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(body), {
            status: status ?? 200,
            headers: {
              'content-type': 'application/json',
              ...headers,
            },
          })
        )
      );
    },
    clearCaches,
  };
};
