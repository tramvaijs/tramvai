import { createToken, declareModule, provide, Scope } from '@tramvai/core';

export interface AnalyticsService {
  track(event: string, payload?: Record<string, unknown>): void;
  getTrackedEvents(): Array<{ event: string; payload?: Record<string, unknown> }>;
}

export const ANALYTICS_SERVICE_TOKEN = createToken<AnalyticsService>('analyticsService');

export const AnalyticsModule = declareModule({
  name: 'AnalyticsModule',
  providers: [
    provide({
      provide: ANALYTICS_SERVICE_TOKEN,
      scope: Scope.SINGLETON,
      useFactory: () => {
        const events: Array<{ event: string; payload?: Record<string, unknown> }> = [];
        return {
          track(event: string, payload?: Record<string, unknown>) {
            events.push({ event, payload });
          },
          getTrackedEvents() {
            return events;
          },
        };
      },
    }),
  ],
});
