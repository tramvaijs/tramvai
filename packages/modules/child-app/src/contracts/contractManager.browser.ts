import isNil from '@tinkoff/utils/is/nil';
import { type Container, provide, optional } from '@tinkoff/dippy';
import {
  CHILD_APP_DI_MANAGER_TOKEN,
  CHILD_APP_INTERNAL_CONFIG_TOKEN,
} from '@tramvai/tokens-child-app';
import type { Contract } from '@tramvai/tokens-child-app';
import type { ChildAppDiManager } from './contractManager.base';
import { BaseChildAppContractManager } from './contractManager.base';

export class ChildAppContractManager extends BaseChildAppContractManager {
  registerContract(childDi: Container, contract: Contract): void {
    childDi.register(
      provide({
        provide: contract,
        useFactory: () => {
          const value = this.appDi.get(optional(contract));

          if (isNil(value)) {
            const { name } = childDi.get(CHILD_APP_INTERNAL_CONFIG_TOKEN);

            this.log.warn(
              `Contract "${contract}" for "${name}" Child App is declared but not provided in the application or contracts fallback`
            );
          }

          return value;
        },
      })
    );
  }

  getRequestHostDi(): Container | null {
    return this.appDi;
  }

  getRequestChildDiManager(): ChildAppDiManager | null {
    return this.appDi.get(optional(CHILD_APP_DI_MANAGER_TOKEN));
  }
}
