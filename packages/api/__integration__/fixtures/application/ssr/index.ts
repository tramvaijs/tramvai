const foo = 'ENTRY';

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(`${process.env.HOST}:${process.env.PORT}`);
});

server.listen(process.env.PORT, () => {
  console.log(`SSR server running at http://${process.env.HOST}:${process.env.PORT}/`);
});
