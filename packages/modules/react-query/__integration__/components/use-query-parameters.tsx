import { useState, useEffect } from 'react';
import { createQuery, useQuery } from '@tramvai/react-query';
import { FAKE_API_CLIENT } from '../fakeApiClient';

const query = createQuery({
  key: (parameter: string) => ['api-group', parameter],
  actionNamePostfix: 'apiGroupQueryAction',
  async fn(parameter) {
    const { payload } = await this.deps.apiClient.get<string>(`api/group/${parameter}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    return payload;
  },
  deps: {
    apiClient: FAKE_API_CLIENT,
  },
});

const Child1 = () => {
  const { isLoading, data } = useQuery(query, 'test-1');

  return <div>Child1: {isLoading ? 'loading...' : data}</div>;
};

const Child2 = () => {
  const { isLoading, data } = useQuery(query, 'test-1');

  return <div>Child2: {isLoading ? 'loading...' : data}</div>;
};

const Child3 = () => {
  const { isLoading, data } = useQuery(query, 'test-2');

  return <div>Child3: {isLoading ? 'loading...' : data}</div>;
};
// eslint-disable-next-line import/no-default-export
export default function Component() {
  const [child2, setChild2Visible] = useState(false);
  const [child3, setChild3Visible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setChild2Visible(true);
    }, 300);

    setTimeout(() => {
      setChild3Visible(true);
    }, 700);
  }, []);

  return (
    <>
      <Child1 />
      {child2 && <Child2 />}
      {child3 && <Child3 />}
    </>
  );
}
