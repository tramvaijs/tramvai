import { createToken, Scope } from '@tinkoff/dippy';
import { SyncTapableHookInstance } from '@tinkoff/hook-runner';

export type TramvaiHooks = {
  'app:initialized': SyncTapableHookInstance<{}>;
  'app:initialize-failed': SyncTapableHookInstance<{ error: Error }>;
  'app:rendered': SyncTapableHookInstance<{}>;
  'app:render-failed': SyncTapableHookInstance<{ error: Error }>;
  'react:render': SyncTapableHookInstance<{}>;
  'react:error': SyncTapableHookInstance<{
    event: string;
    error: Error;
    errorInfo?: {
      componentStack?: string;
    };
    otherErrors?: {
      error: Error;
      errorInfo?: {
        componentStack: string;
      };
    }[];
  }>;
};

export const TRAMVAI_HOOKS_TOKEN = createToken<TramvaiHooks>('tramvaiHooks', {
  scope: Scope.SINGLETON,
});
