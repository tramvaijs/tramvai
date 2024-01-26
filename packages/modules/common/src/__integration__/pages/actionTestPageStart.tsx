import { declareAction } from '@tramvai/core';
import { useNavigate } from '@tinkoff/router';
import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import { ActionTestStatus } from '../components/actionTestStatus';
import { ActionStatus, setSharedActionStatus } from '../stores/actionTestReducer';

const mainAction = declareAction({
  name: 'long-client-action-which-should-be-rejected-on-spa',
  async fn() {
    this.dispatch(setSharedActionStatus(ActionStatus.startPagePending));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.dispatch(setSharedActionStatus(ActionStatus.startPageResolved));
        resolve();
      }, 5000);

      // Add query['abort'] to enable abortion on spa inside action.
      // Exclusively for testing purposes to test cases when pageActions get abort event
      // on spa-transition.
      const url = this.deps?.router.getCurrentUrl() || {};
      if (url.query.abort === 'true') {
        this.abortSignal.addEventListener('abort', () => {
          this.dispatch(setSharedActionStatus(ActionStatus.startPageAborted));
          clearTimeout(timer);
          reject();
        });
      }
    });
  },
  conditions: {
    onlyBrowser: true,
  },
  deps: {
    router: ROUTER_TOKEN,
  },
});

const ActionTestPageStart = () => {
  const navigateToActionTestPageEnd = useNavigate('/action-test-end/');

  return (
    <main>
      <h1>ActionTestPageStart</h1>
      <ActionTestStatus />
      <button type="button" onClick={navigateToActionTestPageEnd}>
        Navigate
      </button>
    </main>
  );
};

ActionTestPageStart.actions = [mainAction];

export default ActionTestPageStart;
