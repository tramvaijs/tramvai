import { useContext } from 'react';
import { ConnectContext } from '../context';
import type { ConsumerContext } from '../types';

export const useConsumerContext = (): ConsumerContext => {
  const context = useContext<ConsumerContext>(ConnectContext);

  if (!context) {
    throw new Error(
      `CONSUMER_CONTEXT not found, have you added "@tramvai/module-common"?
Also, you can check "@tramva/state" library duplicates in project lock file.`
    );
  }

  return context;
};
