import * as dateFns from 'date-fns';
import { declareAction } from '@tramvai/core';
import cn from './lazy-cmp.module.css';
import { testStore } from './stores';

console.log(dateFns);

const action = declareAction({
  name: 'action-lazy',
  fn() {
    this.dispatch(
      testStore.events.logAction(typeof window === 'undefined' ? 'lazy-server' : 'lazy-client')
    );
  },
  conditions: {
    dynamic: true,
  },
});

export const LazyCmp = () => {
  return (
    <>
      <h2 className={cn.LazyCmp}>Lazy</h2>
    </>
  );
};

LazyCmp.actions = [action];

export default LazyCmp;
