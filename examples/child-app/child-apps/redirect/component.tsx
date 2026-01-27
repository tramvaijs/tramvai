import { useDi } from '@tramvai/react';
import { CHILD_APP_BASE_TOKEN } from './tokens';

export const BaseCmp = () => {
  const val = useDi(CHILD_APP_BASE_TOKEN);

  return <div id="redirect">Child App: {val}</div>;
};
