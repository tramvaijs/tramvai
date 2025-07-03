import { declareAction } from '@tramvai/core';
import { PAGE_SERVICE_TOKEN } from '@tramvai/module-router';

const nestedAction = declareAction({
  name: 'nested-action',
  async fn() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    (window as any).__nested_action_executed = true;
  },
});

export const action = declareAction({
  name: 'parent-action',
  async fn() {
    (window as any).__nested_action_executed = false;

    await this.deps?.pageService.navigate('/action-execution-on-server/');

    await this.executeAction(nestedAction);
  },
  deps: {
    pageService: PAGE_SERVICE_TOKEN,
  },
  conditions: {
    dynamic: true,
    onlyBrowser: true,
  },
});

const PreserveAbortReason = () => {
  return (
    <main>
      <h1>PreserveAbortReason</h1>
    </main>
  );
};

PreserveAbortReason.actions = [action];

export default PreserveAbortReason;
