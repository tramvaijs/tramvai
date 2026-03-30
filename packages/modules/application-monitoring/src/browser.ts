import { declareModule } from '@tramvai/core';

import { sharedProviders } from './sharedProviders';

export * from './types';
export * from './tokens';

export const ApplicationMonitoringModule = declareModule({
  name: 'ApplicationMonitoringModule',
  imports: [],
  providers: [...sharedProviders],
});
