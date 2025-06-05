import path from 'path';
import fs from 'fs';
import type Config from 'webpack-chain';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';

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
import { pwaBlock } from '../../blocks/pwa/client';
import PolyfillConditionPlugin from '../../plugins/PolyfillCondition';
import AssetsIntegritiesPlugin from '../../plugins/AssetsIntegritiesPlugin';
import type { IntegrityOptions } from '../../../../typings/configEntry/cli';

export default (configManager: ConfigManager<ApplicationConfigEntry>) => (config: Config) => {
  const {
    polyfill,
    modernPolyfill,
    fileSystemPages,
    env,
    integrity,
    experiments: { runtimeChunk },
  } = configManager;

  const portal = path.resolve(configManager.rootDir, `packages/${process.env.APP_ID}/portal.js`);
  const polyfillPath = path.resolve(configManager.rootDir, polyfill ?? 'src/polyfill');
  const modernPolyfillPath = path.resolve(
    configManager.rootDir,
    modernPolyfill ?? 'src/modern.polyfill'
  );
  const portalExists = fs.existsSync(portal);
  const polyfillExists = !!safeRequireResolve(polyfillPath, typeof polyfill === 'undefined');
  const modernPolyfillExists = !!safeRequireResolve(
    modernPolyfillPath,
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
    .batch(pwaBlock(configManager))
    .when(fileSystemPages.enabled, (cfg) => cfg.batch(pagesResolve(configManager)));

  config.optimization.set('runtimeChunk', runtimeChunk);

  config
    .entry('platform')
    .add(path.resolve(configManager.rootDir, `${configManager.root}/index`))
    .end()
    .when(portalExists, (cfg) => cfg.entry('portal').add(portal))
    .when(polyfillExists, (cfg) => cfg.entry('polyfill').add(polyfillPath))
    .when(modernPolyfillExists, (cfg) => cfg.entry('modern.polyfill').add(modernPolyfillPath));

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
      .use(AssetsIntegritiesPlugin, [{ filename: statsFileName }])
      .end();
  }

  return config;
};
