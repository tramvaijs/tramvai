import * as dateFns from 'date-fns';
import cn from './lazy-cmp-unused.module.css';

console.log(dateFns);

export const LazyCmp = () => {
  return (
    <>
      <h2 className={cn.LazyCmp}>Lazy Unused</h2>
    </>
  );
};

export default LazyCmp;
