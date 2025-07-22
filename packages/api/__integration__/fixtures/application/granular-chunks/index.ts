import * as dippy from '@tinkoff/dippy';

const pages = {
  foo: () => import('./pages/foo'),
  bar: () => import('./pages/bar'),
  baz: () => import('./pages/baz'),
};

console.log(dippy, pages);
