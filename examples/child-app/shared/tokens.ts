import { createToken } from '@tramvai/core';
import type { HttpClient } from '@tramvai/module-http-client';

declare module '@tramvai/module-child-app' {
  export interface TypedContractsRequired {
    FAKE_API_CLIENT: typeof FAKE_API_CLIENT;
    MISSED_CHILD_CONTRACT: typeof MISSED_CHILD_CONTRACT;
    MISSED_CHILD_CONTRACT_FALLBACK: typeof MISSED_CHILD_CONTRACT_FALLBACK;
  }
}

export const FAKE_API_CLIENT = createToken<HttpClient>('fakeApiClient');

export const TEST_CHILD_CONTRACT = createToken<boolean>('testChildContract');
export const MISSED_CHILD_CONTRACT = createToken<() => string>('missedChildContract');
export const MISSED_CHILD_CONTRACT_FALLBACK = createToken<() => string>(
  'missedChildContractFallback'
);
export const MISSED_HOST_CONTRACT = createToken<() => string>('missedHostContract');
export const MISSED_HOST_CONTRACT_FALLBACK = createToken<() => string>(
  'missedHostContractFallback'
);
