import { App } from './App';
import createApp from './createApp';

let server;

if (typeof window !== 'undefined') {
  const { createRoot } = require('react-dom/client');

  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
} else {
  const http = require('http');
  const { renderToString } = require('react-dom/server');

  server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const port = process.env.PORT_STATIC;

    const app = renderToString(<App />);

    res.end(
      `<!DOCTYPE html><html>
      <head>
        <script src="http://localhost:${port}/dist/client/runtime.js"></script>
        <script src="http://localhost:${port}/dist/client/react.js"></script>
        <script src="http://localhost:${port}/dist/client/hmr.js"></script>
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

createApp(server);
