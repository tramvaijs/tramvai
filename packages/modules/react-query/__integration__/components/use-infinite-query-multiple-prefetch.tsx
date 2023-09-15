import { createInfiniteQuery, useInfiniteQuery } from '@tramvai/react-query';
import { FAKE_API_CLIENT } from '../fakeApiClient';

interface Response {
  nextPage?: number;
  list: string[];
}

const delayedInfiniteQuery = createInfiniteQuery({
  key: 'delayedList',
  async fn(_, start = 0) {
    const { payload } = await this.deps.apiClient.get<Response>('api/list', {
      query: {
        count: 30,
        start,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 700));

    return payload;
  },
  getNextPageParam: (page: Response) => {
    return page.nextPage;
  },
  deps: {
    apiClient: FAKE_API_CLIENT,
  },
  infiniteQueryOptions: {},
});

const normalInfiniteQuery = createInfiniteQuery({
  key: 'normalList',
  async fn(_, start = 0) {
    const { payload } = await this.deps.apiClient.get<Response>('api/list', {
      query: {
        count: 30,
        start,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    return payload;
  },
  getNextPageParam: (page: Response) => {
    return page.nextPage;
  },
  deps: {
    apiClient: FAKE_API_CLIENT,
  },
  infiniteQueryOptions: {},
});

const countEntities = (data: any) =>
  data!.pages.reduce((acc: number, page: Response) => acc + page.list.length, 0);

function List({ queryResult, name }: { queryResult: any; name: string }) {
  return (
    <div
      data-testid={name}
      data-status={queryResult.isLoading ? 'loading' : 'finished'}
      data-length={queryResult.isLoading ? '-1' : countEntities(queryResult.data)}
    >
      {queryResult.hasNextPage && (
        <button type="button" onClick={() => queryResult.fetchNextPage()}>
          More
        </button>
      )}
    </div>
  );
}

// eslint-disable-next-line import/no-default-export
export default function Component() {
  const delayedInfiniteQueryResult = useInfiniteQuery(delayedInfiniteQuery);
  const normalInfiniteQueryResult = useInfiniteQuery(normalInfiniteQuery);

  return (
    <div>
      <List name="delayed" queryResult={delayedInfiniteQueryResult} />
      <List name="normal" queryResult={normalInfiniteQueryResult} />
    </div>
  );
}

Component.actions = [delayedInfiniteQuery.prefetchAction(), normalInfiniteQuery.prefetchAction()];
