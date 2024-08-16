import { Module, Scope, commandLineListTokens, provide } from '@tramvai/core';
import flatten from '@tinkoff/utils/array/flatten';
import type { EnvParameter } from '@tramvai/tokens-common';
import {
  CONTEXT_TOKEN,
  COMBINE_REDUCERS,
  ENV_MANAGER_TOKEN,
  ENV_USED_TOKEN,
  CLIENT_ENV_REPOSITORY_TOKEN,
  ENV_TEMPLATE_TOKEN,
} from '@tramvai/tokens-common';
import { SERVER_MODULE_PAPI_PUBLIC_ROUTE } from '@tramvai/tokens-server';
import { createPapiMethod } from '@tramvai/papi';

import { EnvironmentStore } from './shared/EnvironmentStore';
import { EnvironmentManagerServer } from './server/EnvironmentManagerServer';
import { ClientEnvironmentRepository } from './server/ClientEnvironmentRepository';

export { ENV_MANAGER_TOKEN, ENV_USED_TOKEN };

@Module({
  providers: [
    provide({
      provide: ENV_MANAGER_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: ({ tokens, templates }) => {
        return new EnvironmentManagerServer(flatten<EnvParameter>(tokens ?? []), templates ?? []);
      },
      deps: {
        tokens: {
          token: ENV_USED_TOKEN,
          optional: true,
        },
        templates: {
          token: ENV_TEMPLATE_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: CLIENT_ENV_REPOSITORY_TOKEN,
      scope: Scope.REQUEST,
      useFactory: ({ envManager, tokens }) => {
        return new ClientEnvironmentRepository(envManager, flatten<EnvParameter>(tokens ?? []));
      },
      deps: {
        envManager: ENV_MANAGER_TOKEN,
        tokens: {
          token: ENV_USED_TOKEN,
          optional: true,
        },
      },
    }),
    provide({
      provide: COMBINE_REDUCERS,
      useValue: EnvironmentStore,
      multi: true,
    }),
    provide({
      provide: commandLineListTokens.customerStart,
      useFactory: ({ context, clientEnvRepository }) => {
        return function envCommand() {
          context.getStore('environment').setState(clientEnvRepository.getAll());
        };
      },
      multi: true,
      deps: {
        clientEnvRepository: CLIENT_ENV_REPOSITORY_TOKEN,
        context: CONTEXT_TOKEN,
      },
    }),
    provide({
      provide: SERVER_MODULE_PAPI_PUBLIC_ROUTE,
      scope: Scope.SINGLETON,
      multi: true,
      useFactory: ({ environmentManager }: { environmentManager: typeof ENV_MANAGER_TOKEN }) => {
        return createPapiMethod({
          method: 'get',
          path: '/apiList',
          async handler() {
            return environmentManager.clientUsed();
          },
        });
      },
      deps: {
        environmentManager: ENV_MANAGER_TOKEN,
      },
    }),
  ],
})
export class EnvironmentModule {}
