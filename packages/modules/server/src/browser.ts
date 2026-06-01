import type { DI_TOKEN, ExtractDependencyType } from '@tramvai/core';
import { Module, provide } from '@tramvai/core';
import { COMBINE_REDUCERS } from '@tramvai/tokens-common';
import { MetricsModule } from '@tramvai/module-metrics';
import { BrowserTimingModule } from './modules/browserTiming';
import { BrowserPapiModule } from './modules/papi/papi.browser';
import { FormActionResultStore } from './formActionStore';

export * from '@tramvai/tokens-server';
export { FormActionResultStore, setFormActionResult } from './formActionStore';

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
  providers: [
    provide({
      provide: COMBINE_REDUCERS,
      useValue: [FormActionResultStore],
      multi: true,
    }),
  ],
})
export class ServerModule {}
