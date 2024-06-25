import flatten from '@tinkoff/utils/array/flatten';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { optional, type Container } from '@tinkoff/dippy';
import type { Contract, Contracts, HOST_PROVIDED_CONTRACTS } from '@tramvai/tokens-child-app';
import {
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
  CHILD_REQUIRED_CONTRACTS,
  IS_CHILD_APP_CONTRACTS_COMPATIBLE_TOKEN,
  type ChildAppContractManager as IChildAppContractManager,
} from '@tramvai/tokens-child-app';

type HostProvidedContracts = ExtractDependencyType<typeof HOST_PROVIDED_CONTRACTS>;

export abstract class BaseChildAppContractManager implements IChildAppContractManager {
  private hostProvidedContracts: HostProvidedContracts;

  constructor({ hostProvidedContracts }: { hostProvidedContracts: HostProvidedContracts }) {
    this.hostProvidedContracts = hostProvidedContracts;
  }

  registerChildContracts(childDi: Container) {
    const childAppConfig = childDi.get(CHILD_APP_INTERNAL_CONFIG_TOKEN);
    const childHasContractsSupport = childDi.get(optional(IS_CHILD_APP_CONTRACTS_COMPATIBLE_TOKEN));
    const childRequiredContracts = flatten<Contract>(
      childDi.get(optional(CHILD_REQUIRED_CONTRACTS)) ?? []
    );
    const childRequiredContractsKeys = childRequiredContracts.map((c) => c.toString());
    const hostProvidedContracts = this.getHostProvidedContracts(childAppConfig.name);
    // if contracts unsupported, it is a legacy child app, and we need to register all possible contracts
    // otherwise register only required for child app contracts
    const hasContractsToRegistration =
      !childHasContractsSupport || childRequiredContracts.length > 0;

    if (hasContractsToRegistration) {
      for (const contract of hostProvidedContracts) {
        const contractKey = contract.toString();
        // if contracts unsupported, it is a legacy child app, and we need to register all possible contracts
        // otherwise match required and provided contracts by key
        const isChildRequiredContract =
          !childHasContractsSupport || childRequiredContractsKeys.includes(contractKey);

        if (isChildRequiredContract) {
          this.registerContract(childDi, contract);
        }
      }
    }
  }

  abstract registerContract(childDi: Container, contract: Contract): void;

  private getHostProvidedContracts(childAppName: string): Contracts {
    const contracts: Contracts = [];

    // look over all provided by host contracts
    for (const contract of this.hostProvidedContracts) {
      // contracts without childAppName can be registered to any child app
      // otherwise we need to match current and contract child app names
      const contractAvailableForChild =
        !contract.childAppName || contract.childAppName === childAppName;

      if (contractAvailableForChild) {
        contracts.push(...contract.providedContracts);
      }
    }

    return contracts;
  }
}
