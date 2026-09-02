import { Scope, createToken } from '@tramvai/core';

export interface DnsInterceptorOptions {
  enabled: boolean;
  maxTTL: number;
  maxItems: number;
  dualStack?: boolean;
  affinity?: 4 | 6;
}

export const DEFAULT_DNS_INTERCEPTOR_OPTIONS_TOKEN = createToken<DnsInterceptorOptions>(
  'tramvai default dns interceptor options',
  { scope: Scope.SINGLETON }
);

export const DNS_INTERCEPTOR_OPTIONS_TOKEN = createToken<DnsInterceptorOptions>(
  'tramvai dns interceptor options',
  { scope: Scope.SINGLETON }
);
