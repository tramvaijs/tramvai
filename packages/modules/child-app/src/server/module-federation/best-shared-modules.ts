import { gt, eq, satisfies } from 'semver';
import type { SharedModule, SharedScopeItem } from './utils';

export type SharedModuleWithChunks = {
  shareKey: string;
  from: string;
  version: string;
  eager: boolean;
  childAppName?: string;
  childAppVersion?: string;
  chunks?: string[];
};

// TODO: possible better shared deduplication strategy than `resolveBestLoadedSharedModules`
// but can hurt performance and be not very effective
export function resolveBestSharedModules({
  sharedModules,
  sharedScopeItems,
}: {
  sharedModules: SharedModule[];
  sharedScopeItems: SharedScopeItem[];
}): SharedModuleWithChunks[] {
  // group shared modules by shareKey and requiredVersion,
  // then we will pick the best one between groups with the same shareKey
  const bestSharedModulesGroups = new Map<string, Map<string, SharedModuleWithChunks>>();

  for (const sharedModule of sharedModules) {
    const { provides } = sharedModule;
    const { shareKey, requiredVersion } = provides?.[0] ?? {};
    const groupKey = `${shareKey}@${requiredVersion}`;

    if (!bestSharedModulesGroups.has(groupKey)) {
      bestSharedModulesGroups.set(groupKey, new Map());
    }

    for (const sharedScopeItem of sharedScopeItems) {
      // if module is not loaded at this stage, we don't need to use it
      if (sharedScopeItem.shareKey === shareKey && !!sharedScopeItem.loaded) {
        const last = bestSharedModulesGroups.get(groupKey)!.get(shareKey);
        const sharedScopeItemModule = sharedModules.find((m) => {
          return (
            m.provides?.[0]?.shareKey === sharedScopeItem.shareKey &&
            m.from === sharedScopeItem.from
          );
        });
        const { eager = sharedScopeItem.eager } = sharedScopeItemModule?.provides?.[0] ?? {};

        if (
          // check is version satisfies required range
          satisfies(sharedScopeItem.version, requiredVersion) &&
          (!last ||
            // module federation will pick the highest available version
            // https://github.com/webpack/webpack/blob/b67626c7b4ffed8737d195b27c8cea1e68d58134/lib/sharing/ConsumeSharedRuntimeModule.js#L144
            gt(sharedScopeItem.version, last.version) ||
            // if versions are equal then module federation will pick
            // the dep with eager prop (it's set in root-app) of with the child-app with highest name in alphabetical order
            (eq(sharedScopeItem.version, last.version) &&
              (eager !== last.eager
                ? eager
                : (sharedScopeItemModule
                    ? sharedScopeItemModule.childAppName
                    : sharedScopeItem.from) > (last.childAppName ? last.childAppName : last.from))))
        ) {
          bestSharedModulesGroups.get(groupKey)!.set(shareKey, {
            shareKey,
            from: sharedScopeItem.from,
            eager,
            version: sharedScopeItem.version,
            childAppName: sharedScopeItemModule?.childAppName,
            childAppVersion: sharedScopeItemModule?.childAppVersion,
            chunks: sharedScopeItemModule?.chunks,
          });
        }
      }
    }
  }

  // final deduplication
  bestSharedModulesGroups.forEach((modules, groupKey) => {
    const [_, requiredVersion] = groupKey.split('@');

    modules.forEach((module, shareKey) => {
      let best = module;

      bestSharedModulesGroups.forEach((otherModules, otherGroupKey) => {
        if (groupKey !== otherGroupKey) {
          otherModules.forEach((otherModule, otherShareKey) => {
            if (module.shareKey === otherShareKey) {
              if (
                // check is version satisfies required range
                satisfies(otherModule.version, requiredVersion) &&
                // module federation will pick the highest available version
                // https://github.com/webpack/webpack/blob/b67626c7b4ffed8737d195b27c8cea1e68d58134/lib/sharing/ConsumeSharedRuntimeModule.js#L144
                (gt(otherModule.version, best.version) ||
                  // if versions are equal then module federation will pick
                  // the dep with eager prop (it's set in root-app) of with the child-app with highest name in alphabetical order
                  (eq(otherModule.version, best.version) &&
                    (otherModule.eager !== best.eager
                      ? otherModule.eager
                      : (otherModule.childAppName ? otherModule.childAppName : otherModule.from) >
                        (best.childAppName ? best.childAppName : best.from))))
              ) {
                best = otherModule;
              }
            }
          });
        }
      });

      modules.set(shareKey, best);
    });
  });

  const result: SharedModuleWithChunks[] = [];

  bestSharedModulesGroups.forEach((modules) => {
    modules.forEach((module) => {
      result.push(module);
    });
  });

  return result;
}
