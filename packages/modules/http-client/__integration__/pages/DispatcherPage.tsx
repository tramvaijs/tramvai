import { declareAction } from '@tramvai/core';
import { HTTP_CLIENT } from '@tramvai/tokens-http-client';
import { useStore } from '@tramvai/state';
import { testDispatcherReducer } from '../reducers/testDispatcher';

const serverAction = declareAction({
  name: 'serverAction',
  async fn() {
    const { httpClient } = this.deps;

    await Promise.all([
      httpClient.get('http://localhost:3000/foo', {}, { silent: true }).catch(() => {}),
      fetch('http://localhost:3000/bar').catch(() => {}),
    ]);
  },
  deps: {
    httpClient: HTTP_CLIENT,
  },
  conditions: {
    onlyServer: true,
  },
});

export const HttpClientDispatcherPage = () => {
  const testDispatcherState = useStore(testDispatcherReducer);

  return (
    <div>
      <div data-testid="test-dispatcher-state">{testDispatcherState}</div>
    </div>
  );
};

HttpClientDispatcherPage.actions = [serverAction];
