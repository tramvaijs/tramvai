const foo = 'ENTRY';

import(/* webpackChunkName: "dynamic" */ './dynamic').then((bar) => {
  console.log(foo, bar);
});
