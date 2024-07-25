import { createChildApp } from '@tramvai/child-app-core';
import { declareAction, optional, provide } from '@tramvai/core';
import { CommonChildAppModule } from '@tramvai/module-common';
import type { ChildContractsFallback } from '@tramvai/tokens-child-app';
import {
  CHILD_CONTRACTS_FALLBACK,
  CHILD_PROVIDED_CONTRACTS,
  CHILD_REQUIRED_CONTRACTS,
} from '@tramvai/tokens-child-app';
import { ContractsCmp } from './component';
import {
  MISSED_CHILD_CONTRACT,
  MISSED_CHILD_CONTRACT_FALLBACK,
  TEST_CHILD_CONTRACT,
} from '../../shared/tokens';

const contractsAction = declareAction({
  name: 'contractsAction',
  fn() {
    if (typeof window !== 'undefined') {
      (window as any).MISSED_CHILD_CONTRACT = this.deps.missedContract;
      (window as any).MISSED_CHILD_CONTRACT_FALLBACK = this.deps.missedContractFallback!();
    }

    console.log('missed child contract:', this.deps.missedContract);
    console.log('missed child contract with fallback:', this.deps.missedContractFallback());
  },
  deps: {
    missedContract: optional(MISSED_CHILD_CONTRACT),
    missedContractFallback: MISSED_CHILD_CONTRACT_FALLBACK,
  },
  conditions: {
    always: true,
  },
});

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'contracts',
  render: ContractsCmp,
  actions: [contractsAction],
  modules: [CommonChildAppModule],
  providers: [
    provide({
      provide: CHILD_REQUIRED_CONTRACTS,
      useValue: [MISSED_CHILD_CONTRACT, MISSED_CHILD_CONTRACT_FALLBACK],
    }),
    provide({
      provide: CHILD_PROVIDED_CONTRACTS,
      useValue: [TEST_CHILD_CONTRACT],
    }),
    provide({
      provide: TEST_CHILD_CONTRACT,
      useFactory: () => true,
    }),
    provide({
      provide: CHILD_CONTRACTS_FALLBACK,
      useFactory: (): ChildContractsFallback => {
        return ({ childDi, missedContracts }) => {
          console.log('missed child contracts', missedContracts);

          missedContracts.forEach((contract) => {
            if (contract === MISSED_CHILD_CONTRACT_FALLBACK) {
              childDi.register(
                provide({
                  provide: MISSED_CHILD_CONTRACT_FALLBACK,
                  useValue: () => 'this is child fallback',
                })
              );
            }
          });
        };
      },
    }),
  ],
});
