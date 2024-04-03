import { createAction, declareAction } from '@tramvai/core';
import { useStore } from '@tramvai/state';
import {
  actionsReducer,
  pushToActionExecutionOnServerResult,
  pushToActionExecutionOnClientResult,
} from '../stores/actionTestReducer';

const pushToActionExecutionResult =
  typeof window === 'undefined'
    ? pushToActionExecutionOnServerResult
    : pushToActionExecutionOnClientResult;

const action1 = declareAction({
  fn() {
    this.dispatch(pushToActionExecutionResult('action1'));
  },
  name: 'action1',
});
const action2 = declareAction({
  fn() {
    this.dispatch(pushToActionExecutionResult('action2'));
  },
  name: 'action2',
  conditions: {
    dynamic: true,
  },
});

const ActionExecutionOnServer = () => {
  const actionStore = useStore(actionsReducer);

  return (
    <div>
      <h1>Executed actions:</h1>
      <h2 data-testid="actions-server">{actionStore.actionExecutionOnServerResult.join(',')}</h2>
      <h2 data-testid="actions-client">{actionStore.actionExecutionOnClientResult.join(',')}</h2>
    </div>
  );
};

ActionExecutionOnServer.actions = [action1, action2];

export default ActionExecutionOnServer;
