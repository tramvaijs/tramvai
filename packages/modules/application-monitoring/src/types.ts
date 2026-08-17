import type { SyncTapableHookInstance } from '@tramvai/tokens-core';

declare global {
  interface Window {
    __TRAMVAI_INLINE_REPORTER: TramvaiInlineReporter;
  }
}

export interface TramvaiInlineReporter {
  registerTransport?(transportFactory: InlineReporterTransportFactory): void;
  registerExtension?(extensionFactory: InlineReporterExtensionFactory): void;
  send(eventName: string, payload?: { [key: string]: any }): void;
}

export interface InlineReporterParameters {
  appName: string;
  appVersion?: string;
  appRelease?: string;
  [x: string]: any;
}

export type InlineReporterTransport = (eventName: string, payload: Record<string, any>) => void;

export type InlineReporterTransportFactory = (
  parameters: InlineReporterParameters
) => InlineReporterTransport;

// called on every send() and returns the payload for that event - extended with its own
// fields, or the same one unchanged if the event isn't relevant to this extension
export type InlineReporterExtension = (
  eventName: string,
  payload: Record<string, any>
) => Record<string, any>;

export type InlineReporterExtensionFactory = (
  parameters: InlineReporterParameters
) => InlineReporterExtension;
