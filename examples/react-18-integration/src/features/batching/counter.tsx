import React, { useState } from 'react';
import { flushSync } from 'react-dom';

let renderCount = 0;

export const BatchingExample: React.FC = () => {
  const [, setCount] = useState(0);
  const [, setAnotherCount] = useState(false);

  const handleClick = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    setCount((value) => value + 1);
    setAnotherCount((value) => !value);
  };

  const handleSyncClick = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));

    flushSync(() => {
      setCount((value) => value + 1);
    });

    flushSync(() => {
      setAnotherCount((value) => !value);
    });
  };

  return (
    <section>
      <h3>Batching state updates</h3>

      <button onClick={handleClick} type="button">
        Update
      </button>

      <button onClick={handleSyncClick} type="button">
        Update sync
      </button>

      <p suppressHydrationWarning>Renders: {renderCount++}</p>
    </section>
  );
};

BatchingExample.displayName = 'BatchingExample';
