import type { PageComponent } from '@tramvai/react';
import { createBundle } from '@tramvai/core';
import { ChildApp } from '@tramvai/module-child-app';

const Cmp: PageComponent = () => {
  return (
    <>
      <div>Content from root</div>
      <ChildApp name="redirect" />
    </>
  );
};

Cmp.childApps = [{ name: 'redirect' }];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'redirect',
  components: {
    pageDefault: Cmp,
  },
});
