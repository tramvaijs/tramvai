import path from 'path';
import type Config from 'webpack-chain';
import { InjectManifest } from 'workbox-webpack-plugin';
import fs from 'fs';

import { PwaIconsPlugin, WebManifestPlugin, getWorkboxOptions } from '@tramvai/plugin-webpack-pwa';

import type { ConfigManager } from '../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';
import { safeRequireResolve } from '../../../../utils/safeRequire';
import { pwaSharedBlock } from './shared';

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

    if (
      !safeRequireResolve('@tramvai/module-progressive-web-app', rootDir, true) &&
      (pwa.workbox?.enabled || pwa.webmanifest?.enabled)
    ) {
      throw Error('PWA functional requires @tramvai/module-progressive-web-app installed');
    }

    if (pwa.workbox?.enabled) {
      const swSrc = path.join(rootDir, root, pwa.sw?.src);
      const swDest = path.join(rootDir, output.client, pwa.sw?.dest);

      if (!fs.existsSync(swSrc)) {
        throw Error(
          `PWA workbox enabled but Service Worker source file not found by path ${swSrc}`
        );
      }

      const workboxPlugin = new InjectManifest(
        getWorkboxOptions({
          swSrc,
          swDest,
          workbox: pwa.workbox,
          mode: env,
          scope: pwa.sw.scope!,
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

      config.plugin('workbox').use(workboxPlugin);
    }

    if (pwa.webmanifest?.enabled) {
      const webmanifestPlugin = new WebManifestPlugin({
        manifest: pwa.webmanifest,
        icon: pwa.icon,
        assetsPrefix,
      });

      config.plugin('webmanifest').use(webmanifestPlugin);
    }

    if (pwa.icon?.src) {
      const iconSrc = path.join(rootDir, root, pwa.icon.src);
      const pwaIconsPlugin = new PwaIconsPlugin({
        ...pwa.icon,
        src: iconSrc,
        mode: configManager.env,
      });

      config.plugin('pwa-icons').use(pwaIconsPlugin);
    }
  };
