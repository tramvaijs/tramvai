import type {
  PageResource,
  FETCH_WEBPACK_STATS_TOKEN,
  REACT_SERVER_RENDER_MODE,
} from '@tramvai/tokens-render';
import { ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { flushFiles } from './utils/flushFiles';

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
  if (con) { document.write('<script${
    renderMode === 'streaming' ? '' : ' defer="defer"'
  } charset="utf-8" data-critical="true" crossorigin="anonymous" src="${href}"><\\/script>')}
})()`,
    });
  });

  modernPolyfillScripts.forEach((script) => {
    result.push({
      type: ResourceType.script,
      payload: genHref(script),
      attrs: {
        id: 'modern-polyfills',
      },
      slot: ResourceSlot.HEAD_POLYFILLS,
    });
  });

  return result;
};
