import isNil from '@tinkoff/utils/is/nil';
import type { DI_TOKEN, ExtractDependencyType } from '@tinkoff/dippy';
import { type Container, provide, optional } from '@tinkoff/dippy';
import {
  CHILD_APP_DI_MANAGER_TOKEN,
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
} from '@tramvai/tokens-child-app';
import type { Contract } from '@tramvai/tokens-child-app';
import type { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';
import type {
  ChildAppDiManager,
  HostProvidedContracts,
  HostRequiredContracts,
  Logger,
} from './contractManager.base';
import { BaseChildAppContractManager } from './contractManager.base';

declare module '@tramvai/tokens-common' {
  export interface AsyncLocalStorageState {
    tramvaiRequestDi?: ExtractDependencyType<typeof DI_TOKEN>;
  }
}

type AsyncLocalStorageType = ExtractDependencyType<typeof ASYNC_LOCAL_STORAGE_TOKEN>;

export class ChildAppContractManager extends BaseChildAppContractManager {
  private asyncLocalStorage: AsyncLocalStorageType;

  constructor({
    appDi,
    asyncLocalStorage,
    hostProvidedContracts,
    hostRequiredContracts,
    logger,
  }: {
    appDi: Container;
    asyncLocalStorage: AsyncLocalStorageType;
    hostProvidedContracts: HostProvidedContracts | null;
    hostRequiredContracts: HostRequiredContracts | null;
    logger: Logger;
  }) {
    super({
      appDi,
      hostProvidedContracts,
      hostRequiredContracts,
      logger,
    });

    this.asyncLocalStorage = asyncLocalStorage;
  }

  registerContract(childDi: Container, contract: Contract): void {
    childDi.register(
      provide({
        provide: contract,
        useFactory: () => {
          const value =
            this.asyncLocalStorage.getStore()?.tramvaiRequestDi?.get(optional(contract)) ??
            this.appDi.get(optional(contract));

          if (isNil(value)) {
            const { name } = childDi.get(CHILD_APP_INTERNAL_CONFIG_TOKEN);

            this.log.warn(
              `Contract "${contract}" for "${name}" Child App is declared but not provided in the application or contracts fallback`
            );
          }
          // TODO: Request scoped contrace is resolved in Singleton scope - what should we do?

          return value;
        },
      })
    );
  }

  getRequestHostDi(): Container | null {
    return this.asyncLocalStorage.getStore()?.tramvaiRequestDi ?? null;
  }

  getRequestChildDiManager(): ChildAppDiManager | null {
    return (
      this.asyncLocalStorage
        .getStore()
        ?.tramvaiRequestDi?.get(optional(CHILD_APP_DI_MANAGER_TOKEN)) ?? null
    );
  }
}
