import { SharedModule, SharedScopeItem } from './utils';

export type SharedModuleWithChunks = {
  shareKey: string;
  from: string;
  version: string;
  eager: boolean;
  childAppName?: string;
  childAppVersion?: string;
  chunks?: string[];
};

export function resolveBestLoadedSharedModules({
  sharedModules,
  sharedScopeItems,
}: {
  sharedModules: SharedModule[];
  sharedScopeItems: SharedScopeItem[];
}): SharedModuleWithChunks[] {
  const result: SharedModuleWithChunks[] = [];

  for (const sharedScopeItem of sharedScopeItems) {
    const { shareKey, from, eager, loaded } = sharedScopeItem;

    // we need only Child Apps deps, host app shared modules is always loaded on the client
    // and we need to get only used shared modules, `loaded` flag means that module was required by MF runtime
    // https://github.com/webpack/webpack/blob/97d4961cd1de9c69dba0f050a63f3b56bb64fab2/lib/sharing/ConsumeSharedRuntimeModule.js#L104
    if (from.startsWith('child-app') && !!loaded) {
      const sharedModule = sharedModules.find(
        (m) => m.from === from && m.provides?.[0]?.shareKey === shareKey
      );

      if (sharedModule) {
        result.push({
          shareKey,
          from: sharedScopeItem.from,
          eager,
          version: sharedScopeItem.version,
          childAppName: sharedModule?.childAppName,
          childAppVersion: sharedModule?.childAppVersion,
          chunks: sharedModule?.chunks,
        });
      }
    }
  }

  return result;
}
