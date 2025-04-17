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
import { PRELOAD_JS } from '../../constants/performance';
import { flushFiles } from '../utils/flushFiles';

const asyncScriptAttrs = {
  defer: null,
  async: 'async',
};
const deferScriptAttrs = {
  defer: 'defer',
  async: null,
};
let criticalChunks = [];

try {
  criticalChunks = JSON.parse(process.env.__TRAMVAI_CRITICAL_CHUNKS);
} catch (e) {
  // do nothing
}

export const bundleResource = async ({
  bundle,
  modern,
  extractor,
  pageComponent,
  fetchWebpackStats,
  renderMode,
  assetsPrefixFactory,
}: {
  bundle: string;
  modern: boolean;
  extractor: ChunkExtractor;
  pageComponent?: string;
  fetchWebpackStats: typeof FETCH_WEBPACK_STATS_TOKEN;
  renderMode: typeof REACT_SERVER_RENDER_MODE | null;
  assetsPrefixFactory: ExtractDependencyType<typeof ASSETS_PREFIX_TOKEN>;
}) => {
  // for file-system pages preload page chunk against bundle chunk
  const chunkNameFromBundle = isFileSystemPageComponent(pageComponent)
    ? fileSystemPageToWebpackChunkName(pageComponent)
    : last(bundle.split('/'));

  const webpackStats = await fetchWebpackStats({ modern });
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
    webpackStats
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

  styles.forEach((style) =>
    result.push({
      type: ResourceType.style,
      slot: ResourceSlot.HEAD_CORE_STYLES,
      payload: genHref(style),
      attrs: {
        ...(integrities[style] ? { integrity: integrities[style] } : {}),
        'data-critical': 'true',
        // looks like we don't need this scripts preload at all, but also it is official recommendation for streaming
        // https://github.com/reactwg/react-18/discussions/114
        onload: renderMode === 'streaming' ? null : `${PRELOAD_JS}()`,
      },
    })
  );

  baseScripts.forEach((script) =>
    result.push({
      type: ResourceType.script,
      slot: ResourceSlot.HEAD_CORE_SCRIPTS,
      payload: genHref(script),
      attrs: {
        ...(integrities[script] ? { integrity: integrities[script] } : {}),
        'data-critical': 'true',
        ...scriptTypeAttr,
      },
    })
  );

  scripts.forEach((script) =>
    result.push({
      type: ResourceType.script,
      slot: ResourceSlot.HEAD_CORE_SCRIPTS,
      payload: genHref(script),
      attrs: {
        ...(integrities[script] ? { integrity: integrities[script] } : {}),
        'data-critical': 'true',
        ...scriptTypeAttr,
      },
    })
  );

  return result;
};
