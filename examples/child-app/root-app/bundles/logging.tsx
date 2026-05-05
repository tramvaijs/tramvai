import type { PageComponent } from '@tramvai/react';
import { createBundle } from '@tramvai/core';
import { ChildApp } from '@tramvai/module-child-app';

const Cmp: PageComponent = () => {
  return (
    <>
      <ChildApp name="base" />
      <ChildApp name="react-query" />
    </>
  );
};

Cmp.childApps = [{ name: 'base' }];

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'logging',
  components: {
    pageDefault: Cmp,
  },
});
