import path from 'path';
import fs from 'fs';
import type Config from 'webpack-chain';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';
import { PolyfillConditionPlugin } from '@tramvai/plugin-webpack-builder';

import type { ConfigManager } from '../../../../config/configManager';
import type { ApplicationConfigEntry } from '../../../../typings/configEntry/application';
import { safeRequireResolve } from '../../../../utils/safeRequire';

import common from '../../common/main';
import { commonApplication } from '../common';
import files from '../../blocks/filesClient';
import ts from '../../blocks/ts';
import js from '../../blocks/js';
import less from '../../blocks/less';
import css from '../../blocks/css';
import postcssAssets from '../../blocks/postcssAssets';
import nodeClient from '../../blocks/nodeClient';
import { pagesResolve } from '../../blocks/pagesResolve';
import { configToEnv } from '../../blocks/configToEnv';
import {
  DEFAULT_STATS_OPTIONS,
  DEFAULT_STATS_FIELDS,
  DEV_STATS_FIELDS,
  DEV_STATS_OPTIONS,
  WEBPACK_DEBUG_STATS_OPTIONS,
  WEBPACK_DEBUG_STATS_FIELDS,
} from '../../constants/stats';
import AssetsIntegritiesPlugin from '../../plugins/AssetsIntegritiesPlugin';
import type { IntegrityOptions } from '../../../../typings/configEntry/cli';
import { purifyStatsPluginFactory } from '../../plugins/PurifyStatsPlugin';

export default (configManager: ConfigManager<ApplicationConfigEntry>) => (config: Config) => {
  const {
    polyfill,
    modernPolyfill,
    fileSystemPages,
    env,
    integrity,
    experiments: { runtimeChunk, pwa },
  } = configManager;

  const portal = path.resolve(configManager.rootDir, `packages/${process.env.APP_ID}/portal.js`);
  const portalExists = fs.existsSync(portal);

  const polyfillPath = safeRequireResolve(
    polyfill ?? './src/polyfill',
    configManager.rootDir,
    typeof polyfill === 'undefined'
  );
  const modernPolyfillPath = safeRequireResolve(
    modernPolyfill ?? './src/modern.polyfill',
    configManager.rootDir,
    typeof modernPolyfill === 'undefined'
  );

  config
    .name('client')
    .target(['web'])
    .batch(common(configManager))
    .batch(commonApplication(configManager))
    .batch(configToEnv(configManager))
    .batch(files(configManager))
    .batch(js(configManager))
    .batch(ts(configManager))
    .batch(less(configManager))
    .batch(css(configManager))
    .batch(nodeClient(configManager))
    .batch(postcssAssets(configManager))
    .when(fileSystemPages.enabled, (cfg) => cfg.batch(pagesResolve(configManager)));

  config.optimization.set('runtimeChunk', runtimeChunk);
  // move require of pwa build part under if for performance
  if (pwa.workbox?.enabled || pwa.webmanifest?.enabled) {
    const { pwaBlock } = require('../../blocks/pwa/client');
    config.batch(pwaBlock(configManager));
  }

  config
    .entry('platform')
    .add(path.resolve(configManager.rootDir, `${configManager.root}/index`))
    .end()
    .when(portalExists, (cfg) => cfg.entry('portal').add(portal))
    .when(Boolean(polyfillPath), (cfg) => cfg.entry('polyfill').add(polyfillPath))
    .when(Boolean(modernPolyfillPath), (cfg) =>
      cfg.entry('modern.polyfill').add(modernPolyfillPath)
    );

  const statsFileName = 'stats.json';

  config
    .plugin('stats-plugin')
    .use(StatsWriterPlugin, [
      {
        filename: statsFileName,
        stats: {
          ...(env === 'development' ? DEV_STATS_OPTIONS : DEFAULT_STATS_OPTIONS),
          ...(configManager.verboseWebpack ? WEBPACK_DEBUG_STATS_OPTIONS : {}),
        },
        fields: [
          ...(env === 'development' ? DEV_STATS_FIELDS : DEFAULT_STATS_FIELDS),
          ...(configManager.verboseWebpack ? WEBPACK_DEBUG_STATS_FIELDS : []),
        ],
      },
    ])
    .end()
    .plugin('polyfill-condition-plugin')
    .use(PolyfillConditionPlugin, [{ filename: statsFileName }])
    .end()
    .plugin('define')
    .tap((args) => [
      {
        ...args[0],
        'process.env.BROWSER': true,
        'process.env.SERVER': false,
      },
    ]);

  if (integrity) {
    const defaultIntegrityOptions: IntegrityOptions = {
      enabled: 'auto',
      hashFuncNames: ['sha256'],
      hashLoading: 'eager',
    };

    let integrityOptions;
    if (typeof integrity === 'object') {
      integrityOptions = {
        ...defaultIntegrityOptions,
        ...integrity,
      };
    } else {
      integrityOptions = defaultIntegrityOptions;
    }

    config
      .plugin('integrity-plugin')
      .use(SubresourceIntegrityPlugin, [integrityOptions])
      .end()
      // Plugin for transform integrity-plugin result into single integrities field in stats.json
      .plugin('assets-integrity-plugin')
      .use(AssetsIntegritiesPlugin, [{ fileName: statsFileName }])
      .end();
  }

  config
    .plugin('assets-purify-plugin')
    .use(purifyStatsPluginFactory('application'), [{ fileName: statsFileName }])
    .end();

  return config;
};
