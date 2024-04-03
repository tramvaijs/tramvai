import React, { useState, useDeferredValue } from 'react';

import { SlowList, AsyncComponent } from '../../shared/ui';

const Result: React.FC<{ query: string }> = (props) => {
  return <SlowList text={props.query} />;
};

export const UseDeferredQueryExample: React.FC = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <h3>useDeferredValue hook</h3>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type something"
      />

      <Result query={deferredQuery} />
    </>
  );
};

UseDeferredQueryExample.displayName = 'UseDeferredQueryExample';
