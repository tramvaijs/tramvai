import { createToken, Scope } from '@tinkoff/dippy';
import { SyncTapableHookInstance } from '@tinkoff/hook-runner';

export type TramvaiHooks = {
  'app:initialize-started': SyncTapableHookInstance<{}>;
  'app:initialized': SyncTapableHookInstance<{ duration: number }>;
  'app:initialize-failed': SyncTapableHookInstance<{ error: Error }>;
  'app:render-started': SyncTapableHookInstance<{}>;
  'app:rendered': SyncTapableHookInstance<{ duration: number }>;
  'app:render-failed': SyncTapableHookInstance<{ error: Error }>;
  'react:render-started': SyncTapableHookInstance<{}>;
  'react:render': SyncTapableHookInstance<{ event: string; duration: number }>;
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
