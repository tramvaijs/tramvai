import { useSelector, useStore } from '@tramvai/state';
import { testStore } from './stores';
import { anotherRootStore } from '../../root-app/bundles/state';

const ChildOwnStoreCmp = () => {
  const { value } = useStore(testStore);
  const valueFromUseSelector = useSelector([testStore], (state) => {
    return state['child-test'].value;
  });

  return (
    <div id="child-state">
      Current Value from Store: {value} | {valueFromUseSelector}
    </div>
  );
};

const ChildRootStoreCmp = () => {
  const rootValue = useSelector(['root'], (state) => {
    return state.root.value;
  });
  const { value: anotherRootValue } = useStore(anotherRootStore);

  // useStore is broken in v2.0.0 for parent allowed stores, hydration missmatch occurs
  return (
    <div id="root-state" suppressHydrationWarning>
      Current Values from Root Stores: {rootValue} | {anotherRootValue}
    </div>
  );
};

export const StateCmp = () => {
  return (
    <>
      <ChildOwnStoreCmp />
      <hr />
      <ChildRootStoreCmp />
    </>
  );
};
