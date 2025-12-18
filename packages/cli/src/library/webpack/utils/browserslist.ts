import envTargets from '@tinkoff/browserslist-config';
import browserslist from 'browserslist';

import type { Target } from '../../../typings/target';

export function getBrowserslistTargets(rootDir: string, actualTarget: Target) {
  const browserslistConfigRaw = browserslist.findConfig(rootDir);

  // Set defaults if the explicit config for browserslist was not found or the config does not contain the necessary targets
  const browserslistQuery =
    browserslistConfigRaw?.[actualTarget] ?? envTargets[actualTarget] ?? envTargets.defaults;

  return browserslist(browserslistQuery, {
    mobileToDesktop: true,
    env: actualTarget,
  });
}

export function getActualTarget(target, isServer) {
  let actualTarget = target;

  if (!target) {
    if (isServer) {
      actualTarget = 'node';
    }
  }

  return actualTarget;
}
