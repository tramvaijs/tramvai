import { declareAction } from '@tramvai/core';
import { ActionTestStatus } from '../components/actionTestStatus';
import { ActionStatus, setSharedActionStatus } from '../stores/actionTestReducer';

const anyAction = declareAction({
  name: 'action-should-be-not-cancelled-after-cancel-previous-action-on-spa-transition',
  async fn() {
    this.dispatch(setSharedActionStatus(ActionStatus.endPagePending));
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.dispatch(setSharedActionStatus(ActionStatus.endPageResolved));
        resolve();
      }, 1000);
    });
  },
  conditions: {
    onlyBrowser: true,
  },
});

const ActionTestPageEnd = () => {
  return (
    <main>
      <h1>ActionTestPageEnd</h1>
      <ActionTestStatus />
    </main>
  );
};

ActionTestPageEnd.actions = [anyAction];

export default ActionTestPageEnd;
