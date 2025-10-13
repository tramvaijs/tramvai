import { createBundle } from '@tramvai/core';
import { HttpClientPage } from '../pages/Page';
import { HttpClientPapiPage } from '../pages/PapiPage';
import { HttpClientDispatcherPage } from '../pages/DispatcherPage';

export default createBundle({
  name: 'mainDefault',
  components: {
    pageDefault: HttpClientPage,
    'http-client-papi': HttpClientPapiPage,
    'http-client-dispatcher': HttpClientDispatcherPage,
  },
});
