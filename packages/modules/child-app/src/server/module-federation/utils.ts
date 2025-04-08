import type { ChildAppFinalConfig } from '@tramvai/tokens-child-app';
import type {
  ModuleFederationSharedModule,
  ModuleFederationSharedScope,
  ModuleFederationSharedScopeItem,
} from '../../shared/webpack/moduleFederation';
import type { ServerLoader } from '../loader';

export type SharedScopeItem = ModuleFederationSharedScopeItem & {
  shareKey: string;
  version: string;
};

export type SharedModule = ModuleFederationSharedModule & {
  from: string;
  childAppName: string;
  childAppVersion: string;
};

export function getFlatSharedScopeItemsList(
  sharedScope: ModuleFederationSharedScope
): SharedScopeItem[] {
  // flat list of all shared items initialized in shared scope
  const sharedScopeItems: Array<SharedScopeItem> = [];

  for (const shareKey in sharedScope) {
    const sharedDependency = sharedScope[shareKey];

    for (const version in sharedDependency) {
      const sharedScopeItem = sharedDependency[version];

      sharedScopeItems.push({
        ...sharedScopeItem,
        shareKey,
        version,
      });
    }
  }

  return sharedScopeItems;
}

export function getFlatSharedModulesList({
  preloadedConfigs,
  loader,
}: {
  preloadedConfigs: ChildAppFinalConfig[];
  loader: ServerLoader;
}): SharedModule[] {
  const sharedModules: Array<SharedModule> = [];

  for (const config of preloadedConfigs) {
    const stats = 'getStats' in loader ? loader.getStats(config) : undefined;
    const from = `child-app:${config.name}:${config.version}`;

    if (stats && stats.federatedModules) {
      for (const federatedModule of stats.federatedModules) {
        for (const sharedModule of federatedModule.sharedModules) {
          sharedModules.push({
            ...sharedModule,
            from,
            childAppName: config.name,
            childAppVersion: config.version,
          });
        }
      }
    }
  }

  return sharedModules;
}
