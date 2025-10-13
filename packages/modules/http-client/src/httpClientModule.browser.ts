import { declareModule } from '@tinkoff/dippy';
import { PapiClientModule } from './papiClientModule.browser';
import { providers } from './shared';

export const HttpClientModule = /* @__PURE__ */ declareModule({
  name: 'HttpClientModule',
  imports: [PapiClientModule],
  providers: [...providers],
});
