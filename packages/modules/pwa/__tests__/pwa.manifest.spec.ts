import { testModule } from '@tramvai/test-unit';
import { commandLineListTokens } from '@tramvai/core';
import { RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import { TramvaiPwaLightManifestModule } from '../lib/manifest/server';

describe('pwa.manifest', () => {
  const mockedResourceRegistry = {
    register: jest.fn(),
  };

  afterEach(jest.resetAllMocks);

  const manifestUrl = '/manifest.webmanifest';

  it('check manifest registers on customerStart', async () => {
    const { runLine, di } = testModule(TramvaiPwaLightManifestModule, {
      providers: [
        {
          provide: RESOURCES_REGISTRY,
          useValue: mockedResourceRegistry,
        },
      ],
    });

    jest.spyOn(di, 'register');

    // Проходим валидацию манифеста
    expect(() => runLine(commandLineListTokens.init)).not.toThrow();

    runLine(commandLineListTokens.resolvePageDeps);

    expect(mockedResourceRegistry.register).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: `<link rel="manifest" href="${manifestUrl}">`,
      })
    );
  });
});
