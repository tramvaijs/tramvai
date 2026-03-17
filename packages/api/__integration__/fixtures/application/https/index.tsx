import { App } from './App';

if (typeof window === 'undefined') {
  const http = require('http');

  const server = http.createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const staticPort = process.env.PORT_STATIC;

    res.end(
      `<!DOCTYPE html><html>
      <head>
        <script src="https://localhost:${staticPort}/dist/client/runtime.js"></script>
        <script src="https://localhost:${staticPort}/dist/client/react.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://localhost:${staticPort}/dist/client/platform.js"></script>
      </body>
      </html>`
    );
  });

  server.listen(process.env.PORT, () => {
    console.log(`SSR server running at http://${process.env.HOST}:${process.env.PORT}/`);
  });
} else {
  const { hydrateRoot } = require('react-dom/client');
  hydrateRoot(document.getElementById('root')!, <App />);
}
