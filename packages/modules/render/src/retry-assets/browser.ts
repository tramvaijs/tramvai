import { declareModule } from '@tramvai/core';
import { providers } from './providers';

export const TramvaiRetryAssetsModule = declareModule({
  name: 'TramvaiRetryAssetsModule',
  providers: [...providers],
});
