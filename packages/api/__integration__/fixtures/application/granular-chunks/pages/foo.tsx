import * as dippy from '@tinkoff/dippy';
import * as router from '@tinkoff/router';
import * as logger from '@tinkoff/logger';

console.log(dippy, router, logger);

export const FooPage = () => {
  return <h1>Foo Page</h1>;
};

export default FooPage;
