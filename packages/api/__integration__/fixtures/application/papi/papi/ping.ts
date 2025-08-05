import { createPapiMethod } from '@tramvai/papi';

export default createPapiMethod({
  async handler() {
    return 'hello';
  },
});
