import type {
  PageResource,
  FETCH_WEBPACK_STATS_TOKEN,
  REACT_SERVER_RENDER_MODE,
} from '@tramvai/tokens-render';
import { ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { flushFiles } from './utils/flushFiles';
import { asyncScriptAttrs, deferScriptAttrs } from './bundleResource/bundleResource';

export const polyfillResources = async ({
  condition,
  fetchWebpackStats,
  renderMode,
}: {
  condition: string;
  fetchWebpackStats: typeof FETCH_WEBPACK_STATS_TOKEN;
  renderMode: typeof REACT_SERVER_RENDER_MODE;
}) => {
  const webpackStats = await fetchWebpackStats();

  const { publicPath, polyfillCondition } = webpackStats;

  // получает файл полифилла из stats.json.
  const { scripts: polyfillScripts } = flushFiles(['polyfill'], webpackStats, {
    ignoreDependencies: true,
  });

  const { scripts: modernPolyfillScripts } = flushFiles(['modern.polyfill'], webpackStats, {
    ignoreDependencies: true,
  });

  const genHref = (href) => `${publicPath}${href}`;

  const result: PageResource[] = [];

  polyfillScripts.forEach((script) => {
    const href = genHref(script);

    result.push({
      type: ResourceType.inlineScript,
      attrs: {
        id: 'polyfills',
      },
      slot: ResourceSlot.HEAD_POLYFILLS,
      // all scripts are "async" for streaming, so we need to guarantee that polyfills will be loaded before.
      // will hurt performance, because polufills will block page rendering
      // todo: research solution to use "async" for polyfills and wait this script in the application entry point
      payload: `(function (){
  var con;
  try {
    con = ${polyfillCondition} || ${condition};
  } catch (e) {
    con = true;
  }
  if (con) { window.TRAMVAI_POLLYFILL_LOADED = true;
  document.write('<script${
    renderMode === 'streaming' ? '' : ' defer="defer"'
  } charset="utf-8" data-critical="true" crossorigin="anonymous" fetchpriority="high" src="${href}"><\\/script>')}
})()`,
    });
  });

  // defer scripts is not suitable for React streaming, we need to ability to run them as early as possible
  // https://github.com/reactwg/react-18/discussions/114
  const scriptTypeAttr = renderMode === 'streaming' ? asyncScriptAttrs : deferScriptAttrs;

  modernPolyfillScripts.forEach((script) => {
    const href = genHref(script);
    const attrs = {
      crossorigin: 'anonymous',
      fetchpriority: 'high',
    };

    result.push({
      type: ResourceType.script,
      slot: ResourceSlot.HEAD_POLYFILLS,
      payload: href,
      attrs: {
        'data-critical': 'true',
        id: 'modern-polyfills',
        ...attrs,
        ...scriptTypeAttr,
      },
    });
    result.push({
      type: ResourceType.preloadLink,
      payload: href,
      attrs: {
        ...attrs,
        as: 'script',
      },
      slot: ResourceSlot.HEAD_POLYFILLS,
    });
  });

  return result;
};
