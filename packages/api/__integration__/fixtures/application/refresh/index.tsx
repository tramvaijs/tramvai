import { createRoot } from 'react-dom/client';
import { App } from './App';

if (typeof window !== 'undefined') {
  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
} else {
  const http = require('http');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const port = process.env.PORT_STATIC;

    res.end(
      `<!DOCTYPE html><html>
      <head>
        <script src="http://localhost:${port}/dist/client/react.js"></script>
        <script src="http://localhost:${port}/dist/client/hmr.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script src="http://localhost:${port}/dist/client/platform.js"></script>
      </body>
      </html>`
    );
  });

  server.listen(process.env.PORT, () => {
    console.log(`SSR server running at http://localhost:${process.env.PORT}/`);
  });
}
