import { createToken } from '@tramvai/core';
import type { BrowserSentryClientOptions, BrowserMicroSentryClient } from '@micro-sentry/browser';

export const MICRO_SENTRY_INSTANCE_TOKEN = createToken<BrowserMicroSentryClient | null>(
  'MICRO_SENTRY_INSTANCE_TOKEN'
);

export const MICRO_SENTRY_OPTIONS_TOKEN = createToken<BrowserSentryClientOptions>(
  'MICRO_SENTRY_OPTIONS_TOKEN'
);
