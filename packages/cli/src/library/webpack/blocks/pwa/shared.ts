import path from 'path';
import type Config from 'webpack-chain';
import type { SimplifiedPWAConfig } from '@tramvai/plugin-base-builder/lib/types';

import type { ConfigManager } from '../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';

const normalizeUrl = (url: string, scope: string) => {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const normalizedScope = scope.replace(/\/$/, '');
  const result = `${normalizedScope}${normalizedUrl}`;

  return result;
};

export function getPwaInfo(configManager: ConfigManager<ApplicationConfigEntry>) {
  const {
    experiments: { pwa },
  } = configManager;

  const pwaConfigs = Array.isArray(pwa) ? pwa : [pwa];
  const isWorkboxEnabled = pwaConfigs.some((pwaConfig) => Boolean(pwaConfig.workbox?.enabled));
  const isManifestEnabled = pwaConfigs.some((pwaConfig) => Boolean(pwaConfig.webmanifest?.enabled));

  return { pwaConfigs, isManifestEnabled, isWorkboxEnabled };
}

export function isPwaEnabled(configManager: ConfigManager<ApplicationConfigEntry>) {
  const { isWorkboxEnabled, isManifestEnabled } = getPwaInfo(configManager);
  return isWorkboxEnabled || isManifestEnabled;
}

export const pwaSharedBlock =
  (configManager: ConfigManager<ApplicationConfigEntry>) => (config: Config) => {
    const { pwaConfigs, isWorkboxEnabled, isManifestEnabled } = getPwaInfo(configManager);

    const simplifiedPwaConfigs = pwaConfigs.map(({ sw, webmanifest, meta, workbox }) => ({
      sw: {
        scope: sw.scope,
        dest: sw.dest,
        url: normalizeUrl(sw.dest, sw.scope),
      },
      workbox: {
        enabled: workbox.enabled,
      },
      webmanifest: {
        scope: webmanifest.scope,
        dest: webmanifest.dest,
        url: normalizeUrl(webmanifest.dest, webmanifest.scope),
      },
      meta,
    })) satisfies SimplifiedPWAConfig[];
    const pwaScopes = simplifiedPwaConfigs.map((pwaConfig) => pwaConfig.sw.scope);

    config.module
      .rule('pwa-configs')
      // [\\/]cli вместо @tramvai[\\/]cli, т.к. после слияния репозиториев tramvai и tramvai-cli,
      // webpack резолвит симлинк с фактическим путем до packages/cli
      // @todo: найти более надежный вариант, т.к. есть шанс, что будет импортироваться одноименный модуль
      .test(/[\\/]cli[\\/]lib[\\/]external[\\/]pwa.js$/)
      .use('pwaConfigs')
      .loader('@tramvai/plugin-base-builder/lib/loaders/pwaConfig')
      .options({
        pwaConfigs: simplifiedPwaConfigs,
        workboxEnabled: isWorkboxEnabled,
        manifestEnabled: isManifestEnabled,
        pwaScopes,
      })
      .end()
      // babel-loader is required to process this file
      .enforce('pre');
  };
