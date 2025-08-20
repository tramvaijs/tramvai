import { TapableHooks } from '@tinkoff/hook-runner';
import { createMockLogger } from '@tramvai/test-mocks';
import { ChildAppConfigResolutionPlugin } from '@tramvai/tokens-child-app';
import { ChildAppResolutionConfigManager } from './resolutionConfigManager';

describe('ChildAppResolutionConfigManager', () => {
  it('should be possible pass custom configs', async () => {
    const initialConfigs = [
      {
        name: 'sample',
        byTag: {
          latest: {
            version: '0.0.0-stub',
            baseUrl: 'base-url',
          },
        },
        baseUrl: 'base-url',
      },
    ];

    const extendedConfigs = [
      {
        name: 'another-sample',
        byTag: {
          latest: {
            version: '0.0.0-stub',
            baseUrl: 'another-sample-base-url',
          },
        },
        baseUrl: 'another-sample-base-url',
      },
    ];
    const plugin: ChildAppConfigResolutionPlugin = {
      apply(hooks) {
        hooks.fetchConfig.wrap(async (_, payload, next) => {
          const result = await next(payload);

          return [...result, ...extendedConfigs];
        });
      },
    };

    const childAppResolutionConfigManager = new ChildAppResolutionConfigManager({
      configs: initialConfigs,
      logger: createMockLogger(),
      hookFactory: new TapableHooks(),
      plugins: [plugin],
    });

    await childAppResolutionConfigManager.init();

    const initialConfig = childAppResolutionConfigManager.resolve({ name: 'sample' });
    expect(initialConfig?.version).toBe('0.0.0-stub');
    expect(initialConfig?.baseUrl).toBe('base-url');

    const extendedConfig = childAppResolutionConfigManager.resolve({ name: 'another-sample' });

    expect(extendedConfig?.version).toBe('0.0.0-stub');
    expect(extendedConfig?.baseUrl).toBe('another-sample-base-url');

    const notExistingConfig = childAppResolutionConfigManager.resolve({
      name: 'not-existing-config',
    });
    expect(notExistingConfig).toBe(undefined);
  });
});
