import type { SyncTapableHookInstance } from '@tramvai/tokens-core';

declare global {
  interface Window {
    __TRAMVAI_INLINE_REPORTER: TramvaiInlineReporter;
  }
}

export interface TramvaiInlineReporter {
  send(eventName: string, payload?: { [key: string]: any }): void;
}

export interface InlineReporterParameters {
  appName: string;
  appVersion: string | undefined;
  appRelease: string | undefined;
  [x: string]: any;
}
