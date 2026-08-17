/* eslint-disable max-statements */
import fs from 'node:fs';
import path from 'node:path';
import { createToken, declareModule, provide } from '@tinkoff/dippy';
import type { InjectManifest as WebpackInjectManifestPlugin } from 'workbox-webpack-plugin';
import type { RuleSetRule } from 'webpack';

import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  Extension,
} from '@tramvai/api/lib/config';
import {
  WEBPACK_PLUGINS_TOKEN,
  RSPACK_PLUGINS_TOKEN,
} from '@tramvai/plugin-base-builder/lib/shared/plugins';
import type { SimplifiedPWAConfig, PWAConfig } from '@tramvai/plugin-base-builder/lib/types';
import { BUILD_TARGET_TOKEN } from '@tramvai/plugin-base-builder/lib/build-config';
import { DEFINE_PLUGIN_OPTIONS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/define';
import { RULES_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/rules';
import { RESOLVE_ALIAS_TOKEN } from '@tramvai/plugin-base-builder/lib/shared/resolve';
import { resolveAbsolutePathForFile } from '@tramvai/api/lib/utils/path';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';

import { WebManifestPlugin } from './build-plugins/WebManifestPlugin';
import { PwaIconsPlugin } from './build-plugins/PwaIconsPlugin';
import { getWorkboxOptions } from './utils';

export { PwaIconsPlugin, WebManifestPlugin, getWorkboxOptions };

const CREATE_PWA_PLUGINS_TOKEN = createToken('create pwa plugins token');
const PWA_CONFIGS_TOKEN = createToken<SimplifiedPWAConfig[]>('pwa configs');

const normalizeUrl = (url: string, scope: string) => {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const normalizedScope = scope.replace(/\/$/, '');
  const result = `${normalizedScope}${normalizedUrl}`;

  return result;
};

const PWAConfigExtension = {
  pwa: ({ project, parameters }: Parameters<Extension<any>>[0]): PWAConfig[] => {
    if (project.type === 'child-app') {
      return [];
    }

    const { pwa } = project;
    const pwaConfigs = Array.isArray(pwa) ? pwa : [pwa];

    return (pwaConfigs ?? []).map((pwaConfig) => {
      const { meta, webmanifest, sw, workbox, icon } = pwaConfig ?? {};

      const finalPwaConfig = {
        sw: { src: 'sw.ts', dest: 'sw.js', scope: '/', ...sw },
        meta,
        workbox: { enabled: false, ...workbox },
        icon: { dest: 'pwa-icons', sizes: [36, 48, 72, 96, 144, 192, 512], ...icon! },
        webmanifest: {
          enabled: false,
          dest: '/manifest.[hash].json',
          scope: sw?.scope ?? '/',
          name: project.name,
          short_name: project.name,
          theme_color: meta?.themeColor,
          ...webmanifest,
        },
      } satisfies PWAConfig;

      if (finalPwaConfig.webmanifest.dest.includes('[hash]')) {
        if (parameters.mode === 'production') {
          const crypto = require('crypto');
          const hashSum = crypto.createHash('sha256');
          hashSum.update(JSON.stringify(finalPwaConfig.webmanifest));
          const currentHash = hashSum.digest('hex');

          finalPwaConfig.webmanifest.dest = finalPwaConfig.webmanifest.dest.replace(
            '[hash]',
            currentHash.substr(0, 8)
          );
        } else {
          finalPwaConfig.webmanifest.dest = finalPwaConfig.webmanifest.dest
            .replace('.[hash]', '')
            .replace('[hash].', '');
        }
      }

      return finalPwaConfig;
    });
  },
};

type PWAConfigExtensionType = typeof PWAConfigExtension;

declare module '@tramvai/api/lib/config' {
  export interface ApplicationProject {
    pwa?: PWAConfig[] | PWAConfig;
  }
  export interface ConfigurationExtensions extends PWAConfigExtensionType {}
}

export const PwaPlugin = declareModule({
  name: 'PwaPlugin',
  providers: [
    provide({
      provide: CONFIGURATION_EXTENSION_TOKEN,
      useValue: PWAConfigExtension,
    }),
    provide({
      provide: PWA_CONFIGS_TOKEN,
      useFactory: ({ config }) => {
        const { extensions } = config;
        const pwa = extensions.pwa();

        return pwa.map(({ sw, webmanifest, meta, workbox }) => ({
          sw: {
            scope: sw!.scope!,
            dest: sw!.dest!,
            url: normalizeUrl(sw!.dest!, sw!.scope!),
          },
          workbox: {
            enabled: workbox.enabled ?? false,
          },
          webmanifest: {
            scope: webmanifest!.scope!,
            dest: webmanifest!.dest!,
            url: normalizeUrl(webmanifest!.dest!, webmanifest!.scope!),
          },
          meta: meta!,
        }));
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
      },
    }),
    provide({
      provide: RESOLVE_ALIAS_TOKEN,
      useValue: {
        // backward compatibility for old @tramvai/cli pwa mechanism
        '@tramvai/cli/lib/external/pwa': '@tramvai/api/lib/virtual/pwa',
      },
    }),
    provide({
      provide: RULES_TOKEN,
      useFactory: ({ config, pwaConfigs }) => {
        const { extensions } = config;
        const pwa = extensions.pwa();

        const isWorkboxEnabled = pwa.some((pwaConfig) => Boolean(pwaConfig.workbox?.enabled));
        const isManifestEnabled = pwa.some((pwaConfig) => Boolean(pwaConfig.webmanifest?.enabled));

        const pwaScopes = pwaConfigs.map((pwaConfig) => pwaConfig.sw!.scope);

        return {
          // test: /[\\/]cli[\\/]lib[\\/]external[\\/]pwa.js$/,
          test: /[\\/]api[\\/]lib[\\/]virtual[\\/]pwa.js$/,
          loader: require.resolve('@tramvai/plugin-base-builder/lib/loaders/pwaConfig'),
          enforce: 'pre',
          options: {
            pwaConfigs,
            workboxEnabled: isWorkboxEnabled,
            manifestEnabled: isManifestEnabled,
            pwaScopes,
          },
        } satisfies RuleSetRule;
      },
      deps: {
        pwaConfigs: PWA_CONFIGS_TOKEN,
        config: CONFIG_SERVICE_TOKEN,
      },
    }),
    provide({
      provide: DEFINE_PLUGIN_OPTIONS_TOKEN,
      useFactory: ({ config, buildTarget }) => {
        const { assetsPrefix, extensions } = config;
        const pwa = extensions.pwa();

        if (!pwa) {
          return {};
        }

        const defines: Record<string, string> = {};

        if (buildTarget === 'client') {
          defines['process.env.ASSETS_PREFIX'] = JSON.stringify(assetsPrefix);
        }

        return defines;
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
        pwaConfigs: PWA_CONFIGS_TOKEN,
        buildTarget: BUILD_TARGET_TOKEN,
      },
    }),
    provide({
      provide: RSPACK_PLUGINS_TOKEN,
      useFactory: ({ createPlugins }) => {
        const {
          InjectManifest: RspackInfectManifestPlugin,
        } = require('@aaroon/workbox-rspack-plugin');
        return createPlugins({ InjectManifestPlugin: RspackInfectManifestPlugin });
      },
      deps: {
        createPlugins: CREATE_PWA_PLUGINS_TOKEN,
      },
    }),
    provide({
      provide: WEBPACK_PLUGINS_TOKEN,
      useFactory: ({ createPlugins }) => {
        const { InjectManifest: WebpackInjectManifestPlugin } = require('workbox-webpack-plugin');
        return createPlugins({ InjectManifestPlugin: WebpackInjectManifestPlugin });
      },
      deps: {
        createPlugins: CREATE_PWA_PLUGINS_TOKEN,
      },
    }),
    provide({
      provide: CREATE_PWA_PLUGINS_TOKEN,
      useFactory: ({ config, target }) => {
        return ({
          InjectManifestPlugin,
        }: {
          InjectManifestPlugin: typeof WebpackInjectManifestPlugin;
        }) => {
          if (target === 'server') {
            return [];
          }

          const { extensions, rootDir, sourceDir, outputClient, mode, assetsPrefix } = config;
          const pwa = extensions.pwa();

          const isWorkboxEnabled = pwa.some((pwaConfig) => Boolean(pwaConfig.workbox?.enabled));
          const isManifestEnabled = pwa.some((pwaConfig) =>
            Boolean(pwaConfig.webmanifest?.enabled)
          );

          if (
            !safeRequireResolve('@tramvai/module-progressive-web-app', true) &&
            (isWorkboxEnabled || isManifestEnabled)
          ) {
            throw Error('PWA functional requires @tramvai/module-progressive-web-app installed');
          }

          const plugins: any[] = [];

          pwa.forEach((pwaConfig) => {
            if (pwaConfig.workbox?.enabled && pwaConfig.sw?.src && pwaConfig.sw?.dest) {
              const swSrc = resolveAbsolutePathForFile({
                file: pwaConfig.sw?.src,
                rootDir,
                sourceDir,
              });
              const swDest = path.join(rootDir, outputClient, pwaConfig.sw?.dest);

              if (!fs.existsSync(swSrc)) {
                throw Error(
                  `PWA workbox enabled but Service Worker source file not found by path ${swSrc}`
                );
              }

              // @todo: static HTML caching ??? full offline mode for tramvai static ???
              const workboxPlugin = new InjectManifestPlugin(
                getWorkboxOptions({
                  swSrc,
                  swDest,
                  workbox: pwaConfig.workbox,
                  mode,
                  scope: pwaConfig.sw.scope!,
                  assetsPrefix: assetsPrefix!,
                })
              );

              // https://github.com/GoogleChrome/workbox/issues/1790#issuecomment-1241356293
              if (mode === 'development') {
                Object.defineProperty(workboxPlugin, 'alreadyCalled', {
                  get() {
                    return false;
                  },
                  set() {},
                });
              }

              plugins.push(workboxPlugin);
            }

            const scope = pwaConfig.sw!.scope!;
            if (pwaConfig.webmanifest?.enabled) {
              const webmanifestPlugin = new WebManifestPlugin({
                manifest: pwaConfig.webmanifest,
                scope,
                icon: pwaConfig.icon!,
                assetsPrefix: assetsPrefix!,
              });

              plugins.push(webmanifestPlugin);
            }

            if (pwaConfig.icon?.src) {
              const iconSrc = resolveAbsolutePathForFile({
                file: pwaConfig.icon.src,
                rootDir,
                sourceDir,
              });
              const pwaIconsPlugin = new PwaIconsPlugin({
                ...pwaConfig.icon,
                scope,
                src: iconSrc,
                mode,
              });

              plugins.push(pwaIconsPlugin);
            }
          });

          return plugins;
        };
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
        target: BUILD_TARGET_TOKEN,
      },
    }),
  ],
});

export default PwaPlugin;
