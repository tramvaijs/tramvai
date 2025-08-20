import { TapableHooks } from '@tinkoff/hook-runner';

import noop from '@tinkoff/utils/function/noop';
import { ChildAppPreloadManagerPlugin } from '@tramvai/tokens-child-app';
import { createMockStore } from '@tramvai/test-mocks';
import { PreloadManager } from './preload';
import { ChildAppStore } from '../shared/store';

describe('BrowserChildAppPreloadManager', () => {
  it('Should be possible extend default realisation', async () => {
    const preloadMock = jest.fn();
    const runChildAppCommandLineMock = jest.fn();

    const plugin: ChildAppPreloadManagerPlugin = {
      apply(hooks) {
        hooks.runChildAppCommandLine.wrap(async (_, payload, next) => {
          runChildAppCommandLineMock();
          await next(payload);
        });
        hooks.preloadChildApp.wrap(async (_, payload, next) => {
          preloadMock();
          const result = await next(payload);
          return result;
        });
      },
    };
    const preloadManager = new PreloadManager({
      resolveExternalConfig: () => ({
        client: {
          baseUrl: 'base-url',
          entry: '',
          stats: '',
          statsLoadable: '',
        },
        key: 'key',
        name: 'sample',
        server: {
          entry: '',
        },
        tag: 'latest',
        version: '0.0.0-stub',
      }),
      runner: {
        run: async () => {},
      },
      store: createMockStore({
        stores: [ChildAppStore],
      }),
      resolutionConfigManager: {
        init: async () => {},
        resolve: () => {
          return undefined;
        },
      },
      loader: {
        get: noop,
        init: async () => {
          return undefined;
        },
        load: async () => {},
        waitFor: async () => {},
      },
      hookFactory: new TapableHooks(),
      plugins: [plugin],
      diManager: {
        forEachChildDi: noop,
        getChildDi: () => {
          return undefined;
        },
      },
    });
    preloadManager.pageRender();
    await preloadManager.preload({ name: 'child-app' }, undefined);
    await preloadManager.runPreloaded();

    expect(runChildAppCommandLineMock).toHaveBeenCalled();
    expect(preloadMock).toHaveBeenCalled();
  });
});
