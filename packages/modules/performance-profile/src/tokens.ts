import { createToken } from '@tinkoff/dippy';

/**
 * @public
 * @description Provides performance profile module options
 */
export const PERFORMANCE_PROFILE_OPTIONS_TOKEN = createToken<{
  tmpDir?: string;
}>('performance profile options');

/**
 * @private
 */
export const PERFORMANCE_PROFILE_STATE_TOKEN = createToken<{ inProgress?: boolean }>(
  'performance profile state'
);
