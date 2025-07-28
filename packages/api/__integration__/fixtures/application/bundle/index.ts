// force import _interop_require_wildcard from swc
import * as utils from './utils';

const foo = 'ENTRY';

import(/* webpackChunkName: "dynamic" */ './dynamic').then((bar) => {
  console.log(foo, bar, utils);
});
