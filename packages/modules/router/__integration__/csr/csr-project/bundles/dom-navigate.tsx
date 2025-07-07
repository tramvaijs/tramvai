import React from 'react';
import { createBundle } from '@tramvai/core';

export const DomNavigateQuery = () => {
  return (
    <a href="./?test=b">
      <button id="button" type="button">
        Button
      </button>
    </a>
  );
};

export const DomNavigateHash = () => {
  return (
    <a href="#test">
      <button id="button" type="button">
        Button
      </button>
    </a>
  );
};

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'dom-navigate',
  components: {
    DomNavigateQuery,
    DomNavigateHash,
  },
});
