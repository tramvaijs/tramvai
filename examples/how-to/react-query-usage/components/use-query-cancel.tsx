import { QUERY_CLIENT_TOKEN } from '@tramvai/module-react-query';
import { useDi } from '@tramvai/react';
import { createQuery, useQuery } from '@tramvai/react-query';
import { FAKE_API_CLIENT } from '../../fakeApiClient';

const query = createQuery({
  key: 'base',
  async fn(_) {
    const { payload } = await this.deps.apiClient.request<string>({
      path: 'api/cancel',
      signal: this.abortSignal,
    });

    return payload;
  },
  deps: {
    apiClient: FAKE_API_CLIENT,
    queryClient: QUERY_CLIENT_TOKEN,
  },
  conditions: {
    onlyBrowser: true,
  },
});

// eslint-disable-next-line import/no-default-export
export default function Component() {
  // Cancelling the query will result in its state being reverted to its previous state
  const { data, isLoading, refetch } = useQuery(query);
  const queryClient = useDi(QUERY_CLIENT_TOKEN);

  return (
    <div>
      <p>{isLoading ? 'loading...' : data}</p>
      <button
        type="button"
        onClick={() => {
          queryClient.cancelQueries(['base']);
        }}
      >
        cancel
      </button>
      <button
        type="button"
        onClick={() => {
          refetch();
        }}
      >
        retry
      </button>
    </div>
  );
}
