import { PrefixTree } from '@tramvai/core';
import type { SimplifiedPWAConfig } from '@tramvai/plugin-base-builder/lib/types';

export const createSelectActivePwaConfig = (prefixTree: PrefixTree<SimplifiedPWAConfig>) =>
  function selectActivePwaConfig(
    pwaConfigs: SimplifiedPWAConfig[],
    currentPath: string
  ): SimplifiedPWAConfig | undefined {
    if (!pwaConfigs || pwaConfigs.length === 0) {
      return undefined;
    }

    if (pwaConfigs.length === 1) {
      return pwaConfigs[0];
    }

    pwaConfigs.forEach((pwaConfig) => {
      const swScope = pwaConfig.sw!.scope!;
      prefixTree.set(swScope, pwaConfig);
    });

    const result = prefixTree.get(currentPath) ?? undefined;

    return result;
  };
