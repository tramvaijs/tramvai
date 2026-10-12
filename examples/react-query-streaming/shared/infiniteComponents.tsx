import { Suspense } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useSuspenseInfiniteQuery } from '@tramvai/react-query';
import type { DemoResponse } from './api';
import type { DemoInfiniteQuery } from './queries';

const boxStyle = { border: '1px solid #ccc', padding: 8, margin: '8px 0' } as const;

const PagesView = ({
  testId,
  data,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  testId: string;
  data?: InfiniteData<DemoResponse, number>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) => {
  if (!data) {
    return (
      <div data-testid={testId} data-status="pending">
        loading...
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      data-status="success"
      data-pages={data.pages.length}
      data-sources={data.pages.map((page) => page.source).join(',')}
    >
      <ol>
        {data.pages.map((page) => (
          <li key={page.name}>
            {page.name}: data from <b>{page.source}</b>
          </li>
        ))}
      </ol>
      {hasNextPage && (
        <button
          type="button"
          data-testid={`${testId}-more`}
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? 'loading...' : 'load more'}
        </button>
      )}
    </div>
  );
};

export const InfiniteQueryCard = ({ title, query }: { title: string; query: DemoInfiniteQuery }) => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(query);

  return (
    <div style={boxStyle}>
      <h4>useInfiniteQuery: {title}</h4>
      <PagesView
        testId={`infinite-query-${title}`}
        data={data as InfiniteData<DemoResponse, number> | undefined}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  );
};

const SuspenseInfiniteResult = ({ title, query }: { title: string; query: DemoInfiniteQuery }) => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useSuspenseInfiniteQuery(query);

  return (
    <PagesView
      testId={`suspense-infinite-query-${title}`}
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};

export const SuspenseInfiniteQueryCard = ({
  title,
  query,
}: {
  title: string;
  query: DemoInfiniteQuery;
}) => (
  <div style={boxStyle}>
    <h4>useSuspenseInfiniteQuery: {title}</h4>
    <Suspense
      fallback={<div data-testid={`suspense-infinite-query-${title}`}>suspense fallback...</div>}
    >
      <SuspenseInfiniteResult title={title} query={query} />
    </Suspense>
  </div>
);
