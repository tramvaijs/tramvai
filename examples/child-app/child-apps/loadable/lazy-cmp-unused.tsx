import * as dateFns from 'date-fns';
import { declareAction } from '@tramvai/core';
import cn from './lazy-cmp-unused.module.css';
import { testStore } from './stores';

const action = declareAction({
  name: 'action-lazy-unused',
  fn() {
    this.dispatch(
      testStore.events.logAction(
        typeof window === 'undefined' ? 'lazy-unused-server' : 'lazy-unused-client'
      )
    );
  },
  conditions: {
    dynamic: true,
  },
});

export const LazyCmp = () => {
  return (
    <>
      <h2 className={cn.LazyCmp}>Lazy Unused</h2>
    </>
  );
};

LazyCmp.actions = [action];

LazyCmp.dateFns = dateFns;

export default LazyCmp;
