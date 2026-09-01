import { createToken } from '@tramvai/core';

export const DNS_INTERCEPTOR_OPTIONS_TOKEN = createToken<{
  enabled: boolean;
  maxTTL: number;
  maxItems: number;
  dualStack?: boolean;
  affinity?: 4 | 6;
}>('tramvai dns interceptor options');
