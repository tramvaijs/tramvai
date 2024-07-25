/* eslint-disable no-console */
import flatten from '@tinkoff/utils/array/flatten';
import isNil from '@tinkoff/utils/is/nil';
import type { ExtractDependencyType, TokenInterface } from '@tinkoff/dippy';
import { optional, type Container } from '@tinkoff/dippy';
import {
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
  CHILD_REQUIRED_CONTRACTS,
  IS_CHILD_APP_CONTRACTS_COMPATIBLE_TOKEN,
  CHILD_PROVIDED_CONTRACTS,
  CHILD_APP_PRELOAD_MANAGER_TOKEN,
  CHILD_CONTRACTS_FALLBACK,
  HOST_CONTRACTS_FALLBACK,
  CHILD_APP_RESOLVE_CONFIG_TOKEN,
} from '@tramvai/tokens-child-app';
import type {
  CHILD_APP_DI_MANAGER_TOKEN,
  Contract,
  Contracts,
  HOST_PROVIDED_CONTRACTS,
  HOST_REQUIRED_CONTRACTS,
  ChildAppContractManager as IChildAppContractManager,
} from '@tramvai/tokens-child-app';
import type { LOGGER_TOKEN } from '@tramvai/tokens-common';

export type HostProvidedContracts = ExtractDependencyType<typeof HOST_PROVIDED_CONTRACTS>;
export type HostRequiredContracts = ExtractDependencyType<typeof HOST_REQUIRED_CONTRACTS>;
export type ChildAppDiManager = ExtractDependencyType<typeof CHILD_APP_DI_MANAGER_TOKEN>;
export type Logger = ExtractDependencyType<typeof LOGGER_TOKEN>;

export abstract class BaseChildAppContractManager implements IChildAppContractManager {
  protected appDi: Container;
  protected hostProvidedContracts: HostProvidedContracts;
  protected hostRequiredContracts: HostRequiredContracts;
  protected log: ReturnType<Logger>;

  constructor({
    appDi,
    hostProvidedContracts,
    hostRequiredContracts,
    logger,
  }: {
    appDi: Container;
    hostProvidedContracts: HostProvidedContracts | null;
    hostRequiredContracts: HostRequiredContracts | null;
    logger: Logger;
  }) {
    this.appDi = appDi;
    this.hostProvidedContracts = hostProvidedContracts ?? [];
    this.hostRequiredContracts = hostRequiredContracts ?? [];
    this.log = logger('child-app:contract-manager');
  }

  protected abstract registerContract(childDi: Container, contract: Contract): void;

  protected abstract getRequestHostDi(): Container | null;

  protected abstract getRequestChildDiManager(): ChildAppDiManager | null;

  registerChildContracts(childDi: Container) {
    const childAppConfig = childDi.get(CHILD_APP_INTERNAL_CONFIG_TOKEN);
    const childHasContractsSupport = childDi.get(optional(IS_CHILD_APP_CONTRACTS_COMPATIBLE_TOKEN));
    const childRequiredContracts = flatten<Contract>(
      childDi.get(optional(CHILD_REQUIRED_CONTRACTS)) ?? []
    );
    const hostProvidedContracts = this.getHostProvidedContracts(childAppConfig.name);
    const hostProvidedContractsKeys = hostProvidedContracts.map((c) => c.toString());

    // if contracts unsupported, it is a legacy child app, and we need to register all possible contracts
    if (!childHasContractsSupport) {
      hostProvidedContracts.forEach((contract) => {
        this.registerContract(childDi, contract);
      });
      // otherwise register only required for child app contracts
    } else if (childHasContractsSupport && childRequiredContracts.length > 0) {
      const missedContracts: Contract[] = [];

      childRequiredContracts.forEach((contract) => {
        const contractKey = contract.toString();

        if (hostProvidedContractsKeys.includes(contractKey)) {
          this.registerContract(
            childDi,
            // we can't use `contract` here, because token from Child App chunk and from host bundle will not be equal by reference
            hostProvidedContracts.find((c) => c.toString() === contractKey)
          );
        } else {
          this.log.warn(
            `Contract "${contract}" for "${childAppConfig.name}" Child App is not provided in the application`
          );

          missedContracts.push(contract);
        }
      });

      if (missedContracts.length) {
        this.log.warn({
          message: `Missed contracts for "${childAppConfig.name}" Child App`,
          missedContracts,
        });

        const fallbacks = childDi.get(optional(CHILD_CONTRACTS_FALLBACK)) ?? [];

        fallbacks.forEach((fallback) => {
          fallback({
            childDi,
            missedContracts,
          });
        });
      }
    }
  }

  validateChildProvidedContracts(childDi: Container) {
    const childAppConfig = childDi.get(CHILD_APP_INTERNAL_CONFIG_TOKEN);
    const hostDi = this.getRequestHostDi()!;
    const childProvidedContracts = this.getChildProvidedContracts(childDi);
    const childProvidedContractsKeys = childProvidedContracts.map((c) => c.toString());
    const hostRequiredContracts = this.getHostRequiredContracts(childAppConfig.name);
    const missedContracts: Contract[] = [];

    hostRequiredContracts.forEach((required) => {
      const requiredKey = required.toString();

      if (!childProvidedContractsKeys.includes(requiredKey)) {
        missedContracts.push(required);
      }
    });

    if (missedContracts.length) {
      this.log.warn({
        message: `Missed contracts for application, required from "${childAppConfig.name}" Child App`,
        missedContracts,
      });

      const fallbacks = hostDi.get(optional(HOST_CONTRACTS_FALLBACK)) ?? [];

      fallbacks.forEach((fallback) => {
        fallback({
          hostDi,
          missedContracts,
        });
      });
    }
  }

  async getChildProvidedContract<T extends TokenInterface<any>>(
    childAppName: string,
    contract: T
  ): Promise<ExtractDependencyType<T> | null> {
    try {
      // Resolve CHILD_APP_PRELOAD_MANAGER_TOKEN from DI to prevent circular dependency error
      const childAppPreloadManager = this.appDi.get(CHILD_APP_PRELOAD_MANAGER_TOKEN);

      // Wait for Child App loading before trying to resolve contract from Child App DI
      await childAppPreloadManager.preload({ name: childAppName });
    } catch {
      return null;
    }

    const childAppDi = this.getChildDi(childAppName);
    const childProvidedContracts = this.getChildProvidedContracts(childAppName);
    const childProvidedContractsKeys = childProvidedContracts.map((c) => c.toString());
    const hostRequiredContracts = this.getHostRequiredContracts(childAppName);
    const hostRequiredContractsKeys = hostRequiredContracts.map((c) => c.toString());

    if (!hostRequiredContractsKeys.includes((contract as TokenInterface<any>).toString())) {
      this.log.warn(`Contract "${contract}" is not required in the application`);
      return null;
    }

    if (!childProvidedContractsKeys.includes((contract as TokenInterface<any>).toString())) {
      this.log.warn(`Contract "${contract}" is not provided in the "${childAppName}" Child App`);
    }

    const result = (childAppDi?.get(optional(contract)) ??
      // contract can be registered in host DI in fallback
      this.getRequestHostDi()?.get(optional(contract)) ??
      this.appDi.get(optional(contract)) ??
      null) as ExtractDependencyType<T> | null;

    if (isNil(result)) {
      this.log.warn(
        `Contract "${contract}" is declared but not provided in the "${childAppName}" Child App or application contracts fallback`
      );
    }

    return result;
  }

  private getChildDi(childAppName: string): Container | undefined {
    // Resolve CHILD_APP_RESOLVE_CONFIG_TOKEN from DI to prevent scope conflict warning
    const resolveChildAppConfig = (this.getRequestHostDi() ?? this.appDi).get(
      CHILD_APP_RESOLVE_CONFIG_TOKEN
    );
    const childAppConfig = resolveChildAppConfig({ name: childAppName })!;
    // ContractManager has Singleton scope, and we need to get Request scope Child App DI container.
    // At server-side it will be resolved from Async Local Storage, at client-side everything is Singleton
    const childAppDiManager = this.getRequestChildDiManager();
    const childAppDi = childAppDiManager?.getChildDi(childAppConfig);

    return childAppDi;
  }

  /**
   * Pass DI here when we can't resolve it from Child DI manager without cycle
   * - `Container` is used in case when `validateChildProvidedContracts` call this method
   * - `string` is used in case when `getChildProvidedContract` call this method
   */
  private getChildProvidedContracts(childAppNameOrDi: string | Container) {
    const childAppDi =
      typeof childAppNameOrDi === 'string' ? this.getChildDi(childAppNameOrDi) : childAppNameOrDi;
    const childProvidedContracts = flatten<Contract>(
      childAppDi?.get(optional(CHILD_PROVIDED_CONTRACTS)) ?? []
    );

    return childProvidedContracts;
  }

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

  private getHostRequiredContracts(childAppName: string): Contracts {
    const contracts: Contracts = [];

    // look over all required by host contracts
    for (const contract of this.hostRequiredContracts) {
      // host require contract from specific Child APp
      const contractFromChild = contract.childAppName === childAppName;

      if (contractFromChild) {
        contracts.push(...contract.requiredContracts);
      }
    }

    return contracts;
  }
}
/* eslint-enable no-console */
