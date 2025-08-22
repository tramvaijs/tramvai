// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import React, { Fragment } from 'react';

// Short fragment syntax
export const ShortFragment = () => {
  return (
    <>
      <p>Inside short fragment</p>
    </>
  );
};

// Long fragment syntax with React.Fragment
export const LongFragmentReact = () => {
  return (
    <React.Fragment>
      <p>Inside React.Fragment</p>
    </React.Fragment>
  );
};

// Normal component with fragments inside
export const ComponentWithFragments = () => {
  return (
    <div>
      <ShortFragment />
      <>Simple inline fragment</>
      <React.Fragment>React fragment</React.Fragment>
      <Fragment>Imported fragment</Fragment>
    </div>
  );
};