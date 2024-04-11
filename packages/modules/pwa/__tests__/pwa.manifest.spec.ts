import { testModule } from '@tramvai/test-unit';
import { commandLineListTokens } from '@tramvai/core';
import { RESOURCES_REGISTRY } from '@tramvai/tokens-render';
import { TramvaiPwaLightManifestModule } from '../lib/manifest/server';
import { PWA_MANIFEST_INIT_COMMAND_LINE } from '../src/tokens';

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

    expect(di.register).toHaveBeenCalled();

    runLine(commandLineListTokens.customerStart);

    expect(mockedResourceRegistry.register).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: `<link rel="manifest" href="${manifestUrl}">`,
      })
    );
  });

  it('check manifest does not register on customerStart if PWA_MANIFEST_INIT_COMMAND_LINE provided differs', async () => {
    const { runLine, di } = testModule(TramvaiPwaLightManifestModule, {
      providers: [
        {
          provide: RESOURCES_REGISTRY,
          useValue: mockedResourceRegistry,
        },
        {
          provide: PWA_MANIFEST_INIT_COMMAND_LINE,
          useValue: 'resolveUserDeps',
        },
      ],
    });

    jest.spyOn(di, 'register');

    di.register({
      provide: commandLineListTokens.customerStart,
      useValue: () => null,
    });

    // Проходим валидацию манифеста
    expect(() => runLine(commandLineListTokens.init)).not.toThrow();

    expect(di.register).toHaveBeenCalled();

    await runLine(commandLineListTokens.customerStart);

    // Проверяем, что PWA_MANIFEST_INIT_COMMAND_LINE переопределил этап регистрации манифеста
    expect(mockedResourceRegistry.register).not.toHaveBeenCalled();

    await runLine(commandLineListTokens.resolveUserDeps);

    expect(mockedResourceRegistry.register).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: `<link rel="manifest" href="${manifestUrl}">`,
      })
    );
  });
});
