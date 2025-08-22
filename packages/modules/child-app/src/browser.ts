import './shared/typings';

import { Module } from '@tramvai/core';
import { sharedProviders } from './shared/providers';
import { browserProviders } from './browser/providers';
import { ChildAppMonitoringTimingModule } from './browser/timing';

export * from './export';

@Module({
  imports: process.env.NODE_ENV === 'development' ? [ChildAppMonitoringTimingModule] : [],
  providers: [...sharedProviders, ...browserProviders],
})
export class ChildAppModule {}
