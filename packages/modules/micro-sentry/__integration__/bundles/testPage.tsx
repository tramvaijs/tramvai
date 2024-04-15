import { createBundle } from '@tramvai/core';

// tslint:disable-next-line:no-var-requires
import Page from './pageComponent';

export default createBundle({
  name: 'test',
  components: {
    page: Page,
  },
});
