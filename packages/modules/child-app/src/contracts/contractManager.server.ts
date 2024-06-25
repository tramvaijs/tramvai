import isNil from '@tinkoff/utils/is/nil';
import type { DI_TOKEN, ExtractDependencyType } from '@tinkoff/dippy';
import { type Container, provide, optional } from '@tinkoff/dippy';
import type { Contract, HOST_PROVIDED_CONTRACTS } from '@tramvai/tokens-child-app';
import type { ASYNC_LOCAL_STORAGE_TOKEN } from '@tramvai/tokens-common';
import { BaseChildAppContractManager } from './contractManager.base';

declare module '@tramvai/tokens-common' {
  export interface AsyncLocalStorageState {
    tramvaiRequestDi?: ExtractDependencyType<typeof DI_TOKEN>;
  }
}

type HostProvidedContracts = ExtractDependencyType<typeof HOST_PROVIDED_CONTRACTS>;
type AsyncLocalStorageType = ExtractDependencyType<typeof ASYNC_LOCAL_STORAGE_TOKEN>;

export class ChildAppContractManager extends BaseChildAppContractManager {
  private appDi: Container;
  private asyncLocalStorage: AsyncLocalStorageType;

  constructor({
    appDi,
    asyncLocalStorage,
    hostProvidedContracts,
  }: {
    appDi: Container;
    asyncLocalStorage: AsyncLocalStorageType;
    hostProvidedContracts: HostProvidedContracts;
  }) {
    super({ hostProvidedContracts });

    this.appDi = appDi;
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
            // TODO: missed contract
          }
          // TODO: Request scoped contrace is resolved in Singleton scope - what should we do?

          return value;
        },
      })
    );
  }
}
