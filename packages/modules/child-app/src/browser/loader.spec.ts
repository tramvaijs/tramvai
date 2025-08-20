import { createMockLogger } from '@tramvai/test-mocks';
import { TapableHooks } from '@tinkoff/hook-runner';
import { ChildAppLoaderPlugin } from '@tramvai/tokens-child-app';
import { BrowserLoader } from './loader';

describe('BrowserLoader', () => {
  it('should be possible to extend default load realisation', async () => {
    const loadModuleMock = jest.fn();
    const plugin: ChildAppLoaderPlugin = {
      apply(hooks) {
        hooks.loadModule.wrap(async (_, payload) => {
          loadModuleMock();
          return undefined;
        });
      },
    };

    const serverLoader = new BrowserLoader({
      hookFactory: new TapableHooks(),
      plugins: [plugin],
      logger: createMockLogger(),
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
