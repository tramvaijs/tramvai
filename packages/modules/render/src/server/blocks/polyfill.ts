import type {
  PageResource,
  FETCH_WEBPACK_STATS_TOKEN,
  REACT_SERVER_RENDER_MODE,
} from '@tramvai/tokens-render';
import { ResourceSlot, ResourceType } from '@tramvai/tokens-render';
import { flushFiles } from './utils/flushFiles';

export const polyfillResources = async ({
  condition,
  modern,
  fetchWebpackStats,
  renderMode,
}: {
  condition: string;
  modern: boolean;
  fetchWebpackStats: typeof FETCH_WEBPACK_STATS_TOKEN;
  renderMode: typeof REACT_SERVER_RENDER_MODE;
}) => {
  const webpackStats = await fetchWebpackStats({ modern });

  const { publicPath, polyfillCondition } = webpackStats;

  // получает файл полифилла из stats.json\stats.modern.json.
  // В зависимости от версии браузера будет использован полифилл из legacy или modern сборки,
  // т.к. полифиллы для них могут отличаться на основании преобразований `@babel/preset-env`
  const { scripts: polyfillScripts } = flushFiles(['polyfill'], webpackStats, {
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

  return result;
};
