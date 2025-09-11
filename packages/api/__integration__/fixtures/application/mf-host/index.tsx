import { provide } from '@tinkoff/dippy';
// @ts-ignore fake tinkoff/url library for flex tramvai test
import { url } from '@tinkoff/url';
// @ts-ignore fake external library for custom shared deps test
import { external } from 'external-library';

import { logger } from '@tinkoff/logger';

import { App } from './App';

logger.addReporter({ log: () => {} });
logger.info(url);
logger.info(external);

provide({
  provide: 'cool token',
  useValue: 'cool value',
});

if (typeof window !== 'undefined') {
  const { hydrateRoot } = require('react-dom/client');
  hydrateRoot(document.getElementById('root')!, <App />);

  import(/* webpackChunkName: 'data' */ './Dynamic').then(({ default: data }) => {
    console.log(data);
  });
} else {
  const http = require('http');
  const { renderToString } = require('react-dom/server');

  const server = http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const port = process.env.PORT_STATIC;

    const modules: string[] = [];
    for (const moduleName in __webpack_modules__) {
      modules.push(moduleName);
    }

    // @ts-ignore
    const sharedScope = __webpack_share_scopes__;

    const app = renderToString(<App />);

    res.end(
      `<!DOCTYPE html><html>
      <head>
        <script src="http://localhost:${port}/dist/client/runtime.js"></script>
        <script src="http://localhost:${port}/dist/client/tramvai.js"></script>
        <script src="http://localhost:${port}/dist/client/react.js"></script>
        <script>globalThis.serverMfModules = ${JSON.stringify(modules)}</script>
        <script>globalThis.serverShared = ${JSON.stringify(sharedScope)}</script>
      </head>
      <body>
        <div id="root">${app}</div>
        <script src="http://localhost:${port}/dist/client/platform.js"></script>
      </body>
      </html>`
    );
  });

  server.listen(process.env.PORT, () => {
    console.log(`SSR server running at http://localhost:${process.env.PORT}/`);
  });
}
