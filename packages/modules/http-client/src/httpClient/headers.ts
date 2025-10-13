import type { ExtractDependencyType } from '@tinkoff/dippy';
import type { ENV_MANAGER_TOKEN } from '@tramvai/tokens-common';
import type { APP_INFO_TOKEN } from '@tramvai/tokens-core';

import { createUserAgent } from './createUserAgent';

/**
 * nodejs sends "User-Agent: node" header
 * on the server by default. For logging purpose, we are
 * replacing "User-Agent" value with custom one, containing
 * both application name and version.
 *
 * @param appInfo
 * @param envManager
 */
export const transformUserAgent = ({
  appInfo,
  envManager,
}: {
  appInfo: ExtractDependencyType<typeof APP_INFO_TOKEN>;
  envManager: ExtractDependencyType<typeof ENV_MANAGER_TOKEN>;
}): Record<string, string> | undefined => {
  if (typeof window === 'undefined') {
    return { 'User-Agent': createUserAgent({ appInfo, envManager }) };
  }

  return undefined;
};
