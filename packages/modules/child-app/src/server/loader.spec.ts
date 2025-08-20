import { createMockCache, createMockEnvManager, createMockLogger } from '@tramvai/test-mocks';
import { TapableHooks } from '@tinkoff/hook-runner';
import { ChildAppLoaderPlugin } from '@tramvai/tokens-child-app';
import { ServerLoader } from './loader';

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
      cache: createMockCache(),
      hookFactory: new TapableHooks(),
      plugins: [plugin],
      envManager: createMockEnvManager(),
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
