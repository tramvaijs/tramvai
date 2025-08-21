import { createBundle } from '@tramvai/core';
import { PageA } from '../components/pageA';
import { PageB } from '../components/pageB';

export default createBundle({
  name: 'mainDefault',
  components: {
    pageDefault: PageA,
    pageA: PageA,
    pageB: PageB,
  },
});
