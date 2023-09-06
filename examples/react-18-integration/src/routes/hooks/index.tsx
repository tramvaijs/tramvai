import React from 'react';

import {
  UseIdExample,
  UseDeferredQueryExample,
  UseTransitionExample,
  UseTransitionNavigationExample,
} from '../../features/hooks';

export const HooksPage: React.FC = () => {
  return (
    <div>
      <UseIdExample />

      <UseDeferredQueryExample />

      <UseTransitionExample />

      <UseTransitionNavigationExample />
    </div>
  );
};

export default HooksPage;
