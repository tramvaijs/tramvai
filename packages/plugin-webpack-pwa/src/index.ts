/* eslint-disable max-statements */
import fs from 'node:fs';
import path from 'node:path';
import { InjectManifest } from 'workbox-webpack-plugin';
import { declareModule, provide } from '@tinkoff/dippy';

import {
  CONFIGURATION_EXTENSION_TOKEN,
  CONFIG_SERVICE_TOKEN,
  Extension,
} from '@tramvai/api/lib/config';
import {
  DEFINE_PLUGIN_OPTIONS_TOKEN,
  WEBPACK_PLUGINS_TOKEN,
  BUILD_TARGET_TOKEN,
} from '@tramvai/plugin-webpack-builder';
import { resolveAbsolutePathForFile } from '@tramvai/api/lib/utils/path';
import { safeRequireResolve } from '@tramvai/api/lib/utils/require';

import { WebManifestPlugin } from './build-plugins/WebManifestPlugin';
import { PwaIconsPlugin } from './build-plugins/PwaIconsPlugin';
import { PWAConfig } from './types';
import { getWorkboxOptions } from './utils';

export * from './types';
export { PwaIconsPlugin, WebManifestPlugin, getWorkboxOptions };

const PWAConfigExtension = {
  pwa: ({ project, parameters }: Parameters<Extension<any>>[0]): PWAConfig | undefined => {
    if (project.type === 'child-app') {
      return undefined;
    }

    const { meta, webmanifest, sw, workbox, icon } = project.pwa ?? {};

    const pwa = {
      sw: { src: 'sw.ts', dest: 'sw.js', scope: '/', ...sw },
      meta,
      workbox: { enabled: false, ...workbox },
      icon: { dest: 'pwa-icons', sizes: [36, 48, 72, 96, 144, 192, 512], ...icon! },
      webmanifest: {
        enabled: false,
        dest: '/manifest.[hash].json',
        scope: sw?.scope,
        name: project.name,
        short_name: project.name,
        theme_color: meta?.themeColor,
        ...webmanifest,
      },
    } satisfies PWAConfig;

    if (pwa.webmanifest.dest.includes('[hash]')) {
      if (parameters.mode === 'production') {
        const crypto = require('crypto');
        const hashSum = crypto.createHash('sha256');
        hashSum.update(JSON.stringify(pwa.webmanifest));
        const currentHash = hashSum.digest('hex');

        pwa.webmanifest.dest = pwa.webmanifest.dest.replace('[hash]', currentHash.substr(0, 8));
      } else {
        pwa.webmanifest.dest = pwa.webmanifest.dest.replace('.[hash]', '').replace('[hash].', '');
      }
    }

    return pwa;
  },
};

type PWAConfigExtensionType = typeof PWAConfigExtension;

declare module '@tramvai/api/lib/config' {
  export interface ApplicationProject {
    pwa?: PWAConfig;
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
      provide: DEFINE_PLUGIN_OPTIONS_TOKEN,
      useFactory: ({ config, target }) => {
        const { assetsPrefix, extensions, rootDir, sourceDir } = config;
        const pwa = extensions.pwa();

        if (!pwa) {
          return {};
        }

        const defines: Record<string, string> = {
          'process.env.TRAMVAI_PWA_WORKBOX_ENABLED': JSON.stringify(pwa.workbox?.enabled),
          // @todo duplicated logic with path.join
          'process.env.TRAMVAI_PWA_SW_SRC': JSON.stringify(
            path.join(rootDir, sourceDir, pwa.sw!.src!)
          ),
          'process.env.TRAMVAI_PWA_SW_DEST': JSON.stringify(pwa.sw?.dest),
          'process.env.TRAMVAI_PWA_SW_SCOPE': JSON.stringify(pwa.sw?.scope),
          'process.env.TRAMVAI_PWA_MANIFEST_ENABLED': JSON.stringify(pwa.webmanifest?.enabled),
          'process.env.TRAMVAI_PWA_MANIFEST_DEST': JSON.stringify(pwa.webmanifest?.dest),
          'process.env.TRAMVAI_PWA_META': `'${JSON.stringify(pwa?.meta ?? {})}'`,
        };

        if (target === 'client') {
          defines['process.env.ASSETS_PREFIX'] = JSON.stringify(assetsPrefix);
        }

        return defines;
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
        target: BUILD_TARGET_TOKEN,
      },
    }),
    provide({
      provide: WEBPACK_PLUGINS_TOKEN,
      useFactory: ({ config, target }) => {
        if (target === 'server') {
          return [];
        }

        const { extensions, rootDir, sourceDir, outputClient, mode, assetsPrefix } = config;

        const pwa = extensions.pwa();
        if (!pwa) {
          return [];
        }

        if (
          !safeRequireResolve('@tramvai/module-progressive-web-app', true) &&
          (pwa.workbox?.enabled || pwa.webmanifest?.enabled)
        ) {
          throw Error('PWA functional requires @tramvai/module-progressive-web-app installed');
        }

        const plugins = [];

        if (pwa.workbox?.enabled && pwa.sw?.src && pwa.sw?.dest) {
          const swSrc = resolveAbsolutePathForFile({ file: pwa.sw?.src, rootDir, sourceDir });
          const swDest = path.join(rootDir, outputClient, pwa.sw?.dest);

          if (!fs.existsSync(swSrc)) {
            throw Error(
              `PWA workbox enabled but Service Worker source file not found by path ${swSrc}`
            );
          }

          // @todo: static HTML caching ??? full offline mode for tramvai static ???
          const workboxPlugin = new InjectManifest(
            getWorkboxOptions({
              swSrc,
              swDest,
              workbox: pwa.workbox,
              mode,
              scope: pwa.sw.scope!,
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

        if (pwa.webmanifest?.enabled) {
          const webmanifestPlugin = new WebManifestPlugin({
            manifest: pwa.webmanifest,
            icon: pwa.icon!,
            assetsPrefix: assetsPrefix!,
          });

          plugins.push(webmanifestPlugin);
        }

        if (pwa.icon?.src) {
          const iconSrc = path.join(sourceDir, pwa.icon.src);
          const pwaIconsPlugin = new PwaIconsPlugin({
            ...pwa.icon,
            src: iconSrc,
            mode,
          });

          plugins.push(pwaIconsPlugin);
        }

        return plugins;
      },
      deps: {
        config: CONFIG_SERVICE_TOKEN,
        target: BUILD_TARGET_TOKEN,
      },
    }),
  ],
});

export default PwaPlugin;
