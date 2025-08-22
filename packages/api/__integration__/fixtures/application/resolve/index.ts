import path from 'path';
import os from 'os';

// @ts-ignore
// eslint-disable-next-line import/extensions, import/no-unresolved
import { header } from 'components/header';

console.log(path.join('a', 'b'));
console.log(os.version());
console.log(header);
