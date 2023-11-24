import React from 'react';
import type { WebpackStats } from '@tramvai/tokens-render';
import type { ErrorBoundaryComponent } from '@tramvai/react';
import { renderErrorBoundaryPageToString } from './renderErrorBoundaryPageToString';

const publicPath = '/assets-prefix/';
const mockOfWebpackStats: WebpackStats = {
  publicPath,
  outputPath: '/User/test/dist/client/',
  assetsByChunkName: {
    rootErrorBoundary: [
      'rootErrorBoundary.5ea18c802b0277d2.css',
      'rootErrorBoundary.9039e52434797436.js',
    ],
    react: ['react.a0dde5a86c685f52.js'],
  },
  namedChunkGroups: {
    rootErrorBoundary: {
      name: 'rootErrorBoundary',
      chunks: ['react', 'rootErrorBoundary'],
      assets: [
        'react.a0dde5a86c685f52.js',
        'rootErrorBoundary.5ea18c802b0277d2.css',
        'rootErrorBoundary.9039e52434797436.js',
      ],
    },
  },
  entrypoints: {
    rootErrorBoundary: {
      name: 'rootErrorBoundary',
      chunks: ['react', 'rootErrorBoundary'],
      assets: [
        'react.a0dde5a86c685f52.js',
        'rootErrorBoundary.5ea18c802b0277d2.css',
        'rootErrorBoundary.9039e52434797436.js',
      ],
    },
  },
};

const ErrorComponent: ErrorBoundaryComponent = ({ error, url }) => {
  const title = `Error happened at ${url}`;
  return (
    <html lang="ru">
      <head>
        <title>{title}</title>
      </head>
      <body>
        <h1>Unknown Error</h1>
        <p id="error-mesage">{error.message}</p>
      </body>
    </html>
  );
};

describe('renderErrorBoundaryPageToString', () => {
  it('renders to string successfully', async () => {
    const result = renderErrorBoundaryPageToString({
      element: ErrorComponent,
      requestUrl: '/test-error',
      webpackStats: mockOfWebpackStats,
      error: {
        name: 'some-root-error',
        message: 'something happened',
        stack: 'at line ...',
      },
      httpStatus: 500,
    });

    expect(result).toMatchInlineSnapshot(`
      "<html lang="ru"><head><title>Error happened at http://localhost/test-error</title><script>window.serverUrl = {"href":"/test-error","origin":"http://localhost","protocol":"http:","username":"","password":"","port":"","pathname":"/test-error","path":"/test-error","search":"","hash":"","query":{}};window.serverError = new Error("something happened");Object.assign(window.serverError, {"name":"some-root-error","status":500,"message":"something happened","stack":"at line ..."});</script>
      <link data-chunk="rootErrorBoundary" rel="stylesheet" href="/assets-prefix/rootErrorBoundary.5ea18c802b0277d2.css">
      <script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">[]</script><script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json">{"namedChunks":[]}</script>
      <script async data-chunk="rootErrorBoundary" src="/assets-prefix/react.a0dde5a86c685f52.js"></script>
      <script async data-chunk="rootErrorBoundary" src="/assets-prefix/rootErrorBoundary.9039e52434797436.js"></script>
      </head><body><h1>Unknown Error</h1><p id="error-mesage">something happened</p></body></html>"
    `);
  });
});
