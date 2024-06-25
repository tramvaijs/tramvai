import isNil from '@tinkoff/utils/is/nil';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { type Container, provide, optional } from '@tinkoff/dippy';
import type { Contract, HOST_PROVIDED_CONTRACTS } from '@tramvai/tokens-child-app';
import { BaseChildAppContractManager } from './contractManager.base';

type HostProvidedContracts = ExtractDependencyType<typeof HOST_PROVIDED_CONTRACTS>;

export class ChildAppContractManager extends BaseChildAppContractManager {
  private appDi: Container;

  constructor({
    appDi,
    hostProvidedContracts,
  }: {
    appDi: Container;
    hostProvidedContracts: HostProvidedContracts;
  }) {
    super({ hostProvidedContracts });

    this.appDi = appDi;
  }

  registerContract(childDi: Container, contract: Contract): void {
    childDi.register(
      provide({
        provide: contract,
        useFactory: () => {
          const value = this.appDi.get(optional(contract));

          if (isNil(value)) {
            // TODO: missed contract
          }

          return value;
        },
      })
    );
  }
}
