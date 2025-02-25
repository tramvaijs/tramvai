import { createLoggerMocks } from '@tramvai/internal-test-utils/mocks/tramvai/logger';
import { createEnvManagerMock } from '@tramvai/internal-test-utils/mocks/tramvai/envManager';
import { getPort } from '@tramvai/internal-test-utils/utils/getPort';
import type { LOGGER_TOKEN, ENV_MANAGER_TOKEN } from '@tramvai/module-common';
import type { APP_INFO_TOKEN } from '@tramvai/core';
import { staticAppCommand } from './static';

const mockLogger = createLoggerMocks().loggerFactoryMock;

interface Deps {
  logger: typeof LOGGER_TOKEN;
  envManager: typeof ENV_MANAGER_TOKEN;
  appInfo: typeof APP_INFO_TOKEN;
}

describe('server/static', () => {
  let serverPort: string;
  let ENV_MOCK: Record<string, string | undefined>;
  let mockDeps: Deps;
  let serverInstance: Awaited<ReturnType<ReturnType<typeof staticAppCommand>>>;

  beforeAll(() => {
    serverPort = `${getPort()}`;

    ENV_MOCK = {
      PORT_STATIC: serverPort,
      HOST_STATIC: 'localhost',
      DEV_STATIC: 'true',
    };

    mockDeps = {
      logger: mockLogger,
      appInfo: {
        appName: 'test',
      },
      envManager: {
        ...createEnvManagerMock(),
        get: (envVariable: string) => {
          return ENV_MOCK[envVariable];
        },
      },
    };
  });

  afterEach(async () => {
    await serverInstance?.close();
  });

  it('should run with with default HOST_STATIC and PORT_STATIC env variables', async () => {
    const appStatic = staticAppCommand(mockDeps);
    serverInstance = await appStatic();

    expect(mockLogger.info).toHaveBeenCalledWith(`Running static server on 0.0.0.0:${serverPort}`);
    expect(serverInstance?.addresses()[0]).toMatchObject({
      address: '0.0.0.0',
      family: 'IPv4',
      port: +serverPort,
    });
  });

  it('should run with with target HOST_STATIC env variable', async () => {
    const targetHost = '127.0.0.1';
    const { HOST_STATIC } = ENV_MOCK;
    ENV_MOCK.HOST_STATIC = targetHost;

    const appStatic = staticAppCommand(mockDeps);
    serverInstance = await appStatic();

    ENV_MOCK.HOST_STATIC = HOST_STATIC;

    expect(mockLogger.info).toHaveBeenCalledWith(
      `Running static server on ${targetHost}:${serverPort}`
    );
    expect(serverInstance?.addresses()[0]).toMatchObject({
      address: targetHost,
      family: 'IPv4',
      port: +serverPort,
    });
  });

  it('should run with default host when HOST_STATIC env variable is not defined', async () => {
    const { HOST_STATIC } = ENV_MOCK;
    ENV_MOCK.HOST_STATIC = undefined;

    const appStatic = staticAppCommand(mockDeps);
    serverInstance = await appStatic();

    ENV_MOCK.HOST_STATIC = HOST_STATIC;

    expect(mockLogger.info).toHaveBeenCalledWith(`Running static server on 0.0.0.0:${serverPort}`);
    expect(serverInstance?.addresses()[0]).toMatchObject({
      address: '0.0.0.0',
      family: 'IPv4',
      port: +serverPort,
    });
  });

  it('should not run without DEV_STATIC env variable', async () => {
    const { DEV_STATIC } = ENV_MOCK;
    delete ENV_MOCK.DEV_STATIC;
    const appStatic = staticAppCommand(mockDeps);
    ENV_MOCK.DEV_STATIC = DEV_STATIC;
    serverInstance = await appStatic();

    expect(await appStatic()).toEqual(undefined);
  });
});
