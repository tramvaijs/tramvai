import React from 'react';
import { useStore } from '@tramvai/state';
import { actionsReducer } from '../stores/actionTestReducer';

export const ActionTestStatus = () => {
  const actionStore = useStore(actionsReducer);

  return <h2 data-testid="status">{actionStore.actionStatus.join(',')}</h2>;
};
