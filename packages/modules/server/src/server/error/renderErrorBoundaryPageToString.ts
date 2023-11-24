import { ChunkExtractor } from '@loadable/server';
import { parse } from '@tinkoff/url';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import type { AnyError } from '@tramvai/safe-strings';
import { safeStringify } from '@tramvai/safe-strings';
import type { WebpackStats } from '@tramvai/tokens-render';
import type { ErrorBoundaryComponent } from '@tramvai/react';

export const renderErrorBoundaryPageToString = ({
  element,
  webpackStats,
  requestUrl,
  httpStatus,
  error,
}: {
  element: ErrorBoundaryComponent;
  webpackStats: WebpackStats;
  requestUrl: string;
  httpStatus: number;
  error: AnyError;
}) => {
  const extractor = new ChunkExtractor({ stats: webpackStats, entrypoints: ['rootErrorBoundary'] });
  const url = parse(requestUrl);
  const serializedError = {
    name: error.name,
    status: httpStatus,
    message: error.message,
    stack: error.stack,
  };

  return renderToString(createElement(element, { error: serializedError, url })).replace(
    '</head>',
    [
      '<script>' +
        `window.serverUrl = ${safeStringify(url)};` +
        `window.serverError = new Error(${safeStringify(serializedError.message)});` +
        `Object.assign(window.serverError, ${safeStringify(serializedError)});` +
        '</script>',
      extractor.getStyleTags(),
      extractor.getScriptTags(),
      '</head>',
    ]
      .filter(Boolean)
      .join('\n')
  );
};
