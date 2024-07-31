import type { DI_TOKEN, ExtractDependencyType } from '@tramvai/core';
import { Module } from '@tramvai/core';
import { MetricsModule } from '@tramvai/module-metrics';
import { BrowserTimingModule } from './modules/browserTiming';
import { BrowserPapiModule } from './modules/papi/papi.browser';

export * from '@tramvai/tokens-server';

declare module '@tramvai/tokens-common' {
  export interface AsyncLocalStorageState {
    tramvaiRequestDi?: ExtractDependencyType<typeof DI_TOKEN>;
  }
}

@Module({
  imports: [
    MetricsModule,
    BrowserPapiModule,
    ...[process.env.NODE_ENV === 'development' && BrowserTimingModule].filter(Boolean),
  ],
  providers: [],
})
export class ServerModule {}
