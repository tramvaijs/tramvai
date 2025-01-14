import { createToken } from '@tinkoff/dippy';
import type { TapableHooks } from '@tinkoff/hook-runner';

export type {
  TapableHooks,
  SyncTapableHookInstance,
  AsyncTapableHookInstance,
  AsyncParallelTapableHookInstance,
} from '@tinkoff/hook-runner';

export const TAPABLE_HOOK_FACTORY_TOKEN = createToken<TapableHooks>('tramvai tapable hook factory');
