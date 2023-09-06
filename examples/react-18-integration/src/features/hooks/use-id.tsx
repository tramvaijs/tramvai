import React from 'react';
import { useId } from 'react';

const generateId = () => (Math.random() * 1000000000).toFixed();

const WithHook: React.FC = () => {
  const id = useId();

  return <div id={id}>Div without hydration error</div>;
};

const WithoutHook: React.FC = () => {
  const id = generateId();

  return <div id={id}>Div with hydration error (see console)</div>;
};

export const UseIdExample: React.FC = () => {
  return (
    <>
      <h3>useId hook</h3>

      <WithHook />

      <WithoutHook />
    </>
  );
};

UseIdExample.displayName = 'UseIdExample';
