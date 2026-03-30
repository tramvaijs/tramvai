import { createToken } from '@tinkoff/dippy';

import type { InlineReporterParameters, TramvaiInlineReporter } from './types';

export const INLINE_REPORTER_PARAMETERS_TOKEN = createToken<InlineReporterParameters>(
  'INLINE_REPORTER_PARAMETERS_TOKEN'
);

export const INLINE_REPORTER_FACTORY_SCRIPT_TOKEN = createToken<
  (inlineReporterParameters: InlineReporterParameters) => TramvaiInlineReporter
>('INLINE_REPORTER_FACTORY_SCRIPT');
