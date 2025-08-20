import { createMockCache, createMockEnvManager, createMockLogger } from '@tramvai/test-mocks';
import { TapableHooks } from '@tinkoff/hook-runner';
import { ChildAppLoaderPlugin } from '@tramvai/tokens-child-app';
import {
  createCacheMock,
  createCacheMocks,
} from '@tramvai/internal-test-utils/mocks/tramvai/cache';
import { Cache } from '@tramvai/tokens-common';
import { ServerLoader } from './loader';

const { cacheMock, cacheFactoryMock } = createCacheMocks();
describe('ServerLoader', () => {
  it('should be possible to extend default load realisation', async () => {
    const loadModuleMock = jest.fn();
    const plugin: ChildAppLoaderPlugin = {
      apply(hooks) {
        hooks.loadModule.wrap(async (_, _payload, _next) => {
          loadModuleMock();

          return undefined;
        });
      },
    };

    const serverLoader = new ServerLoader({
      logger: createMockLogger(),
      createCache: () => ({}) as Cache,
      hookFactory: new TapableHooks(),
      plugins: [plugin],
      envManager: createMockEnvManager(),
      cacheOptions: null,
      asyncLocalStorage: null,
    });

    await serverLoader.load({
      client: { baseUrl: '', entry: '', stats: '', statsLoadable: '' },
      server: { entry: '' },
      name: 'child-app',
      key: 'child-app',
      version: '0.0.0-stub',
      tag: 'latest',
    });

    expect(loadModuleMock).toHaveBeenCalled();
  });
});
