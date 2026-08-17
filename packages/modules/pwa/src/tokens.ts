import { createToken } from '@tinkoff/dippy';
import type { Workbox } from 'workbox-window';
import type { SimplifiedPWAConfig, PwaMetaOptions } from '@tramvai/plugin-base-builder/lib/types';
import type { PrefixTree } from '@tramvai/core';

export type WebManifest = {
  [key: string]: any;
};

/**
 * @description Workbox instance
 */
export const PWA_WORKBOX_TOKEN = createToken<() => Promise<Workbox | null>>('pwa workbox');

/**
 * @description PWA active configuration
 */
export const PWA_ACTIVE_CONFIG_TOKEN = createToken<SimplifiedPWAConfig | undefined>(
  'pwa active config'
);

/**
 * @description PWA active configuration
 */
export const PWA_RESOLVE_TOKEN = createToken<
  (pwaConfigs: SimplifiedPWAConfig[], currentPath: string) => SimplifiedPWAConfig | undefined
>('pwa resolve config token');

/**
 * @description PWA prefix tree singleton
 */
export const PWA_PREFIX_TREE = createToken<PrefixTree<SimplifiedPWAConfig>>('pwa prefix tree');

/**
 * @description Token to owerwrite default - `pwa.sw.dest`
 */
export const PWA_SW_URL_TOKEN = createToken<string | undefined>('pwa sw url');

/**
 * @description Token to owerwrite default - `pwa.sw.scope`
 */
export const PWA_SW_SCOPE_TOKEN = createToken<string | undefined>('pwa sw scope');

/**
 * @description Token to owerwrite default - `pwa.manifest.scope`
 */
export const PWA_MANIFEST_SCOPE_TOKEN = createToken<string | undefined>('pwa manifest scope');

/**
 * @description Token to add query params to sw url
 */
export const PWA_SW_PARAMS_TOKEN = createToken<Record<string, string>>('pwa sw params', {
  multi: true,
});

/**
 * @description Token to owerwrite default - `${pwa.webmanifest.path}manifest.${pwa.webmanifest.ext}`
 */
export const PWA_MANIFEST_URL_TOKEN = createToken<string | undefined>('pwa manifest url');

/**
 * @description Token to owerwrite default - `pwa.meta` (meta tags will be added to all pages)
 */
export const PWA_META_TOKEN = createToken<PwaMetaOptions>('pwa meta');
