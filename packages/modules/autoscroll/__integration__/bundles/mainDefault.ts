import { createBundle } from '@tramvai/core';
import { PageA } from '../components/pageA';
import { PageB } from '../components/pageB';
import { PageC } from '../components/pageC';

export default createBundle({
  name: 'mainDefault',
  components: {
    pageDefault: PageA,
    pageA: PageA,
    pageB: PageB,
    pageC: PageC,
  },
});
