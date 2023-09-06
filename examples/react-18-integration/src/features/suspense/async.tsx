import React, { Suspense } from 'react';

import { AsyncComponent } from '../../shared/ui';

export const SuspenseExample: React.FC = () => {
  return (
    <>
      <h3>Suspense</h3>

      <Suspense fallback={<h4>Loading...</h4>}>
        <p>I am waiting for async component loaded too</p>

        <AsyncComponent />
      </Suspense>
    </>
  );
};

SuspenseExample.displayName = 'SuspenseExample';
