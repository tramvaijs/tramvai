import has from '@tinkoff/utils/object/has';
import last from '@tinkoff/utils/array/last';
import type { ChunkExtractor } from '@loadable/server';
import type {
  PageResource,
  FETCH_WEBPACK_STATS_TOKEN,
  REACT_SERVER_RENDER_MODE,
  ASSETS_PREFIX_TOKEN,
} from '@tramvai/tokens-render';
import { ResourceType, ResourceSlot } from '@tramvai/tokens-render';
import { isFileSystemPageComponent, fileSystemPageToWebpackChunkName } from '@tramvai/experiments';
import type { ExtractDependencyType } from '@tinkoff/dippy';
import { flushFiles } from '../utils/flushFiles';
import { fetchWebpackRuntime } from '../utils/fetchWebpackRuntime';

export const asyncScriptAttrs = {
  defer: null,
  async: 'async',
};
export const deferScriptAttrs = {
  defer: 'defer',
  async: null,
};
let criticalChunks = [];

try {
  criticalChunks = JSON.parse(process.env.__TRAMVAI_CRITICAL_CHUNKS);
} catch (e) {
  // do nothing
}

// eslint-disable-next-line max-statements
export const bundleResource = async ({
  bundle,
  extractor,
  pageComponent,
  fetchWebpackStats,
  inlineWebpackRuntime,
  renderMode,
  assetsPrefixFactory,
}: {
  bundle: string;
  extractor: ChunkExtractor;
  pageComponent?: string;
  fetchWebpackStats: typeof FETCH_WEBPACK_STATS_TOKEN;
  inlineWebpackRuntime: boolean;
  renderMode: typeof REACT_SERVER_RENDER_MODE | null;
  assetsPrefixFactory: ExtractDependencyType<typeof ASSETS_PREFIX_TOKEN>;
}) => {
  // for file-system pages preload page chunk against bundle chunk
  const chunkNameFromBundle = isFileSystemPageComponent(pageComponent)
    ? fileSystemPageToWebpackChunkName(pageComponent)
    : last(bundle.split('/'));

  const webpackStats = await fetchWebpackStats();
  const { publicPath, assetsByChunkName, integrities = {} } = webpackStats;

  const bundles: string[] = has('common-chunk', assetsByChunkName)
    ? ['common-chunk', chunkNameFromBundle]
    : [chunkNameFromBundle];
  const lazyChunks = extractor.getMainAssets().map((entry) => entry.chunk);

  const { scripts: baseScripts } = flushFiles(['vendor'], webpackStats, {
    ignoreDependencies: true,
  });
  const { scripts, styles } = flushFiles(
    [...bundles, ...lazyChunks, ...criticalChunks, 'platform'],
    webpackStats,
    {
      exclude: ['runtime'],
    }
  );

  const genHref = (href) => `${publicPath}${href}`;

  const result: PageResource[] = [];
  const assetsPrefix = assetsPrefixFactory();

  if (process.env.NODE_ENV === 'production' || (assetsPrefix && assetsPrefix !== 'static')) {
    result.push({
      type: ResourceType.inlineScript,
      slot: ResourceSlot.HEAD_CORE_SCRIPTS,
      payload: `window.ap = ${`"${assetsPrefix}"`};`,
    });
  }

  // defer scripts is not suitable for React streaming, we need to ability to run them as early as possible
  // https://github.com/reactwg/react-18/discussions/114
  const scriptTypeAttr = renderMode === 'streaming' ? asyncScriptAttrs : deferScriptAttrs;

  const { scripts: webpackRuntimeScript } = flushFiles(['runtime'], webpackStats);
  // If webpack runtime is presented is always single chunk
  const webpackRuntimeScriptName = webpackRuntimeScript[0];

  if (webpackRuntimeScriptName) {
    if (inlineWebpackRuntime) {
      const webpackRuntime = await fetchWebpackRuntime(genHref(webpackRuntimeScriptName));

      result.push({
        type: ResourceType.inlineScript,
        slot: ResourceSlot.HEAD_WEBPACK_RUNTIME,
        payload: webpackRuntime,
        attrs: {
          id: 'webpack-runtime',
        },
      });
    } else {
      const webpackRuntimeSrc = genHref(webpackRuntimeScriptName);
      const webpackRuntimeAttrs = {
        crossorigin: 'anonymous',
        fetchpriority: 'high',
        ...(integrities[webpackRuntimeScriptName]
          ? { integrity: integrities[webpackRuntimeScriptName] }
          : {}),
      };

      result.push({
        type: ResourceType.script,
        slot: ResourceSlot.HEAD_WEBPACK_RUNTIME,
        payload: webpackRuntimeSrc,
        attrs: {
          'data-critical': 'true',
          ...webpackRuntimeAttrs,
          ...scriptTypeAttr,
        },
      });
      result.push({
        type: ResourceType.preloadLink,
        slot: ResourceSlot.HEAD_PERFORMANCE,
        payload: webpackRuntimeSrc,
        attrs: {
          ...webpackRuntimeAttrs,
          as: 'script',
        },
      });
    }
  }

  styles.forEach((style) =>
    result.push({
      type: ResourceType.style,
      slot: ResourceSlot.HEAD_CORE_STYLES,
      payload: genHref(style),
      attrs: {
        ...(integrities[style] ? { integrity: integrities[style], crossorigin: 'anonymous' } : {}),
        'data-critical': 'true',
        fetchpriority: 'high',
      },
    })
  );

  baseScripts.concat(scripts).forEach((script) => {
    const href = genHref(script);
    const attrs = {
      crossorigin: 'anonymous',
      fetchpriority: 'high',
      ...(integrities[script] ? { integrity: integrities[script] } : {}),
    };

    result.push({
      type: ResourceType.script,
      slot: ResourceSlot.HEAD_CORE_SCRIPTS,
      payload: href,
      attrs: {
        'data-critical': 'true',
        ...attrs,
        ...scriptTypeAttr,
      },
    });
    result.push({
      type: ResourceType.preloadLink,
      slot: ResourceSlot.HEAD_PERFORMANCE,
      payload: href,
      attrs: {
        ...attrs,
        as: 'script',
      },
    });
  });

  return result;
};
