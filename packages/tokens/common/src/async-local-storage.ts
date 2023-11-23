import type { AsyncLocalStorage } from 'async_hooks';
import { createToken } from '@tinkoff/dippy';

export const ASYNC_LOCAL_STORAGE_TOKEN = createToken<AsyncLocalStorage<AsyncLocalStorageState>>(
  'ASYNC_LOCAL_STORAGE_TOKEN'
);

export interface AsyncLocalStorageState {}
