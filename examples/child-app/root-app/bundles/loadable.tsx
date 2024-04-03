import type { PageComponent } from '@tramvai/react';
import { createBundle } from '@tramvai/core';
import { ChildApp } from '@tramvai/module-child-app';

const Cmp: PageComponent = () => {
  return (
    <>
      <div>Content from root</div>
      <ChildApp name="loadable" />
    </>
  );
};

Cmp.childApps = [{ name: 'loadable' }];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'loadable',
  components: {
    pageDefault: Cmp,
  },
});
