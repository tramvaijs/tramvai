import { createQuery, useQuery } from '@tramvai/react-query';
import { FAKE_API_CLIENT } from '../fakeApiClient';

const delayedQuery = createQuery({
  key: 'delayedQuery',
  async fn(_) {
    const { payload } = await this.deps.apiClient.get<string>('api/base');
    await new Promise((resolve) => setTimeout(resolve, 700));

    return payload;
  },
  deps: {
    apiClient: FAKE_API_CLIENT,
  },
});

const normalQuery = createQuery({
  key: 'normalQuery',
  async fn(_) {
    const { payload } = await this.deps.apiClient.get<string>('api/base');
    await new Promise((resolve) => setTimeout(resolve, 50));

    return payload;
  },
  deps: {
    apiClient: FAKE_API_CLIENT,
  },
});

// eslint-disable-next-line import/no-default-export
export default function Component() {
  const delayedQueryResult = useQuery(delayedQuery);
  const normalQueryResult = useQuery(normalQuery);

  return (
    <div data-testid="wrapper">
      <div data-testid="delayed">
        {delayedQueryResult.isLoading ? 'loading' : delayedQueryResult.data}
      </div>
      <div data-testid="normal">
        {normalQueryResult.isLoading ? 'loading' : normalQueryResult.data}
      </div>
    </div>
  );
}

Component.actions = [delayedQuery.prefetchAction(), normalQuery.prefetchAction()];
