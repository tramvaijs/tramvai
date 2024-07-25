import type { PageComponent } from '@tramvai/react';
import { createBundle, declareAction } from '@tramvai/core';
import { CHILD_APP_CONTRACT_MANAGER, ChildApp } from '@tramvai/module-child-app';
import {
  MISSED_HOST_CONTRACT,
  MISSED_HOST_CONTRACT_FALLBACK,
  TEST_CHILD_CONTRACT,
} from '../../shared/tokens';

const actionWithChildProvidedContract = declareAction({
  name: 'actionWithChildProvidedContract',
  async fn() {
    const { childContractManager } = this.deps;

    const childProvidedContract = await childContractManager.getChildProvidedContract(
      'contracts',
      TEST_CHILD_CONTRACT
    );
    const missedContract = await childContractManager.getChildProvidedContract(
      'contracts',
      MISSED_HOST_CONTRACT
    );
    const missedContractFallback = await childContractManager.getChildProvidedContract(
      'contracts',
      MISSED_HOST_CONTRACT_FALLBACK
    );

    if (typeof window !== 'undefined') {
      (window as any).TEST_CHILD_CONTRACT = childProvidedContract;
      (window as any).MISSED_HOST_CONTRACT = missedContract;
      (window as any).MISSED_HOST_CONTRACT_FALLBACK = missedContractFallback!();
    }

    console.log('missed host contract:', missedContract);
    console.log('missed host contract with fallback:', missedContractFallback!());
  },
  deps: {
    childContractManager: CHILD_APP_CONTRACT_MANAGER,
  },
  conditions: {
    always: true,
  },
});

const Cmp: PageComponent = () => {
  return (
    <>
      <div>Content from root</div>
      <ChildApp name="contracts" />
    </>
  );
};

Cmp.actions = [actionWithChildProvidedContract];

Cmp.childApps = [{ name: 'contracts' }];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'contracts',
  components: {
    pageDefault: Cmp,
  },
});
