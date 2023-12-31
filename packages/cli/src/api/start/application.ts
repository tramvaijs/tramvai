import type { Container } from '@tinkoff/dippy';
import type { Params, Result } from './index';
import { showBanner } from './utils/banner';
import {
  ABSTRACT_BUILDER_FACTORY_TOKEN,
  COMMAND_PARAMETERS_TOKEN,
  SERVER_TOKEN,
  STATIC_SERVER_TOKEN,
} from '../../di/tokens';
import {
  INIT_HANDLER_TOKEN,
  CLOSE_HANDLER_TOKEN,
  PROCESS_HANDLER_TOKEN,
  STRICT_ERROR_HANDLE,
} from './tokens';
import { runHandlers } from '../../utils/runHandlers';
import { serverProviders } from './providers/application/server';
import { sharedProviders } from './providers/application/shared';
import { sharedProviders as commonSharedProviders } from './providers/shared';
import { registerProviders } from '../../utils/di';

export const startApplication = async (di: Container): Result => {
  const options = di.get(COMMAND_PARAMETERS_TOKEN as Params);

  const { buildType } = options;

  const shouldBuildClient = buildType !== 'server';
  const shouldBuildServer = buildType !== 'client';

  registerProviders(di, [
    ...commonSharedProviders,
    ...sharedProviders,
    ...(shouldBuildServer ? serverProviders : []),
  ]);

  await runHandlers(di.get({ token: INIT_HANDLER_TOKEN, optional: true }));

  const staticServer = di.get(STATIC_SERVER_TOKEN);
  const server = di.get({ token: SERVER_TOKEN, optional: true });

  showBanner(di);

  const builderFactory = di.get(ABSTRACT_BUILDER_FACTORY_TOKEN);
  const builder = await builderFactory.createBuilder('webpack', {
    options: {
      shouldBuildClient,
      shouldBuildServer,
    },
  });

  await runHandlers(di.get({ token: PROCESS_HANDLER_TOKEN, optional: true }));
  const builderStart = await builder.start({ strictError: di.get(STRICT_ERROR_HANDLE) });

  return {
    server,
    staticServer,
    builder,
    ...builderStart,
    close: async () => {
      await builderStart.close();
      await runHandlers(di.get({ token: CLOSE_HANDLER_TOKEN, optional: true }));
    },
  };
};
