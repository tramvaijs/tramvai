import React from 'react';
import { useRoute, Link } from '@tramvai/module-router';

export const RouterCmp: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const { actualPath } = useRoute();

  return (
    <>
      <div id="path">Actual Path: {actualPath}</div>

      {props.children}

      <footer style={{ paddingTop: '2000px' }}>
        <Link url="/react-query">Link to /react-query</Link>
      </footer>
    </>
  );
};
