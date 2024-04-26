import { declareModule } from '@tramvai/core';

import { browserProviders } from './providers';

export * from './tokens';

export const TramvaiMicroSentryModule = declareModule({
  name: 'TramvaiMicroSentryModule',
  providers: browserProviders,
  imports: [],
});
