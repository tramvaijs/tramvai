// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import React, { Fragment } from 'react';
// Short fragment syntax
export const ShortFragment = ()=>{
    return <>

      <p data-qa-file="jsx_fragment_no_tag">Inside short fragment</p>

    </>;
};
// Long fragment syntax with React.Fragment
export const LongFragmentReact = ()=>{
    return <React.Fragment>

      <p data-qa-file="jsx_fragment_no_tag">Inside React.Fragment</p>

    </React.Fragment>;
};
// Normal component with fragments inside
export const ComponentWithFragments = ()=>{
    return <div data-qa-file="jsx_fragment_no_tag">

      <ShortFragment data-qa-file="jsx_fragment_no_tag"/>

      <>Simple inline fragment</>

      <React.Fragment>React fragment</React.Fragment>

      <Fragment>Imported fragment</Fragment>

    </div>;
};
