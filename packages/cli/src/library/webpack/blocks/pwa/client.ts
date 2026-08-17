import path from 'path';
import type Config from 'webpack-chain';
import { InjectManifest } from 'workbox-webpack-plugin';
import fs from 'fs';

import { PwaIconsPlugin, WebManifestPlugin, getWorkboxOptions } from '@tramvai/plugin-webpack-pwa';

import type { ConfigManager } from '../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';
import { safeRequireResolve } from '../../../../utils/safeRequire';
import { validateSwScopesOverlap } from '../../../../utils/validateSwScopesOverlap';
import { getPwaInfo, pwaSharedBlock } from './shared';

export const pwaBlock =
  // eslint-disable-next-line max-statements
  (configManager: ConfigManager<ApplicationConfigEntry>) => (config: Config) => {
    const {
      experiments: { pwa },
      rootDir,
      root,
      output,
      env,
      sourceMap,
      assetsPrefix,
    } = configManager;

    config.batch(pwaSharedBlock(configManager));

    const { pwaConfigs, isWorkboxEnabled, isManifestEnabled } = getPwaInfo(configManager);

    if (
      !safeRequireResolve('@tramvai/module-progressive-web-app', rootDir, true) &&
      (isWorkboxEnabled || isManifestEnabled)
    ) {
      throw Error('PWA functional requires @tramvai/module-progressive-web-app installed');
    }

    validateSwScopesOverlap(pwaConfigs.map(({ sw }) => sw.scope));

    if (isWorkboxEnabled) {
      // Fix `ERROR in Invalid URL` problem
      // https://github.com/webpack/webpack/issues/9570#issuecomment-520713006
      if (sourceMap) {
        config.output.set('devtoolNamespace', 'tramvai');
      }

      config.plugin('define').tap((args) => [
        {
          ...args[0],
          'process.env.ASSETS_PREFIX': JSON.stringify(assetsPrefix),
        },
      ]);
    }

    pwaConfigs.forEach((pwaConfig, index) => {
      const pwaScope = pwaConfig.sw.scope;

      if (pwaConfig.workbox?.enabled) {
        const swSrc = path.join(rootDir, root, pwaConfig.sw?.src);
        const swDest = path.join(rootDir, output.client, pwaConfig.sw?.dest);

        if (!fs.existsSync(swSrc)) {
          throw Error(
            `PWA workbox enabled but Service Worker source file not found by path ${swSrc}`
          );
        }

        const workboxPlugin = new InjectManifest(
          getWorkboxOptions({
            swSrc,
            swDest,
            workbox: pwaConfig.workbox,
            mode: env,
            scope: pwaConfig.sw.scope!,
            assetsPrefix: assetsPrefix!,
          })
        );

        // https://github.com/GoogleChrome/workbox/issues/1790#issuecomment-1241356293
        if (env === 'development') {
          Object.defineProperty(workboxPlugin, 'alreadyCalled', {
            get() {
              return false;
            },
            set() {},
          });
        }

        config.plugin(`workbox-${index}`).use(workboxPlugin);
      }

      if (pwaConfig.webmanifest?.enabled) {
        const webmanifestPlugin = new WebManifestPlugin({
          manifest: pwaConfig.webmanifest,
          scope: pwaScope,
          icon: pwaConfig.icon,
          assetsPrefix,
        });

        config.plugin(`webmanifest-${index}`).use(webmanifestPlugin);
      }

      if (pwaConfig.icon?.src) {
        const iconSrc = path.join(rootDir, root, pwaConfig.icon.src);
        const pwaIconsPlugin = new PwaIconsPlugin({
          ...pwaConfig.icon,
          scope: pwaScope,
          src: iconSrc,
          mode: configManager.env,
        });

        config.plugin(`pwa-icons-${index}`).use(pwaIconsPlugin);
      }
    });
  };
