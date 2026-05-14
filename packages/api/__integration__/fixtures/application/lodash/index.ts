// @swc/plugin-transform-imports limitation - works only with named imports
import { assign } from 'lodash';

console.log(assign({ a: 1 }, { b: 2 }));
