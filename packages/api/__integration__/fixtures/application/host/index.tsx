import React from 'react';
import ReactDOM from 'react-dom';

if (typeof window !== 'undefined') {
  const { createRoot } = require('react-dom/client');
  const rootElement = document.getElementById('element');

  if (rootElement) {
    const root = createRoot();
    const component = <div>hello world</div>;
  }

  // @ts-expect-error
  window.sharedScope = __webpack_require__.S;
} else {
  const http = require('http');

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const query = Object.fromEntries(url.searchParams);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    const port = process.env.PORT_STATIC;
    const childAppPort = query.port;
    const version = '0.0.0-stub';

    res.end(
      `<!DOCTYPE html><html>
      <head>
        <script src="http://localhost:${port}/dist/client/runtime.js"></script>
        <script src="http://localhost:${port}/dist/client/react.js"></script>
        <script src="http://localhost:${port}/dist/client/hmr.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script src="http://localhost:${port}/dist/client/platform.js"></script>
        <script src="http://localhost:${childAppPort}/refresh/refresh_client@${version}.js"></script>
        <script>
          (async () => {
            const childAppId = 'child-app__http://localhost:${childAppPort}/refresh/refresh_client@${version}.js';
            globalThis[childAppId].init(window.sharedScope.default);
            const entry = await globalThis[childAppId].get('entry');
            entry();
          })()
        </script>
      </body>
      </html>`
    );
  });

  server.listen(process.env.PORT, () => {
    console.log(`SSR server running at http://localhost:${process.env.PORT}/`);
  });
}
