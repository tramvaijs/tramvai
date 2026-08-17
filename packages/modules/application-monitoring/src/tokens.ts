import { createToken } from '@tinkoff/dippy';

import type {
  InlineReporterExtensionFactory,
  InlineReporterParameters,
  InlineReporterTransportFactory,
  TramvaiInlineReporter,
} from './types';

/**
 * @description inline reporter parameters will be passed to the transports and extensions factory functions
 */
export const INLINE_REPORTER_PARAMETERS_TOKEN = createToken<Partial<InlineReporterParameters>>(
  'INLINE_REPORTER_PARAMETERS_TOKEN',
  { multi: true }
);

/**
 * @description token to override default inline reporter, use it on your own risk
 */
export const INLINE_REPORTER_FACTORY_SCRIPT_TOKEN = createToken<
  (inlineReporterParameters: InlineReporterParameters) => TramvaiInlineReporter
>('INLINE_REPORTER_FACTORY_SCRIPT');

export const INLINE_REPORTER_TRANSPORTS_TOKEN = createToken<InlineReporterTransportFactory>(
  'INLINE_REPORTER_TRANSPORTS_TOKEN',
  { multi: true }
);

export const INLINE_REPORTER_EXTENSIONS_TOKEN = createToken<InlineReporterExtensionFactory>(
  'INLINE_REPORTER_EXTENSIONS_TOKEN',
  { multi: true }
);
