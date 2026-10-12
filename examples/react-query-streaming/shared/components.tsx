import type { ReactNode } from 'react';
import { Component, Suspense, useEffect, useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tramvai/react-query';
import type { DemoResponse } from './api';
import { useClientCalls } from './api';
import type { DemoQuery } from './queries';

const boxStyle = { border: '1px solid #ccc', padding: 8, margin: '8px 0' } as const;

/**
 * Milliseconds since navigation start when `ready` became true on the client
 */
const useClientTime = (ready: boolean) => {
  const [time, setTime] = useState<number | null>(null);

  useEffect(() => {
    if (ready && time === null) {
      setTime(Math.round(performance.now()));
    }
  }, [ready, time]);

  return time;
};

const ResultView = ({
  testId,
  data,
  error,
}: {
  testId: string;
  data?: DemoResponse;
  error?: Error | null;
}) => {
  const renderedAt = useClientTime(!!data || !!error);

  if (error) {
    return (
      <div data-testid={testId} data-status="error">
        error: {error.message}
        {renderedAt !== null && <> · shown at +{renderedAt}ms</>}
      </div>
    );
  }

  if (!data) {
    return (
      <div data-testid={testId} data-status="pending">
        loading...
      </div>
    );
  }

  return (
    <div data-testid={testId} data-status="success" data-source={data.source}>
      data from <b>{data.source}</b>, request took {data.finishedAt - data.startedAt}ms
      {renderedAt !== null && <> · shown at +{renderedAt}ms</>}
    </div>
  );
};

/**
 * Regular `useQuery`, no Suspense: SSR renders loader, data should come with the stream
 */
export const UseQueryCard = ({ title, query }: { title: string; query: DemoQuery }) => {
  const { data, error } = useQuery(query);

  return (
    <div style={boxStyle}>
      <h4>useQuery: {title}</h4>
      <ResultView testId={`use-query-${title}`} data={data} error={error} />
    </div>
  );
};

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: (error: Error) => ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children;
  }
}

const SuspenseResult = ({ title, query }: { title: string; query: DemoQuery }) => {
  const { data } = useSuspenseQuery(query);

  return <ResultView testId={`suspense-query-${title}`} data={data} />;
};

/**
 * `useSuspenseQuery`: data and ready HTML of the boundary should come with the stream
 */
export const SuspenseQueryCard = ({ title, query }: { title: string; query: DemoQuery }) => (
  <div style={boxStyle}>
    <h4>useSuspenseQuery: {title}</h4>
    <ErrorBoundary
      fallback={(error) => (
        <ResultView testId={`suspense-query-${title}`} error={error} />
      )}
    >
      <Suspense fallback={<div data-testid={`suspense-query-${title}`}>suspense fallback...</div>}>
        <SuspenseResult title={title} query={query} />
      </Suspense>
    </ErrorBoundary>
  </div>
);

export const Scenario = ({
  title,
  expected,
  children,
}: {
  title: string;
  expected: ReactNode;
  children: ReactNode;
}) => (
  <section>
    <h2>{title}</h2>
    <p>
      <i>Expected after feature:</i> {expected}
    </p>
    {children}
  </section>
);

/**
 * All client-side calls of the fake API, from host and child-app.
 * Any call here for a query which was started on the server is a duplicated request.
 */
export const ClientCallsLog = () => {
  const calls = useClientCalls();
  const hydratedAt = useClientTime(true);

  return (
    <div style={{ ...boxStyle, background: '#f6f6f6' }}>
      <div>hydrated at: {hydratedAt === null ? '-' : `+${hydratedAt}ms`}</div>
      <div>client API calls ({calls.length}):</div>
      <ul data-testid="client-calls">
        {calls.map((call, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            {call.name} at +{call.at}ms
          </li>
        ))}
      </ul>
    </div>
  );
};
