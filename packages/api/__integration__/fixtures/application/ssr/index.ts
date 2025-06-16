const foo = 'ENTRY';

import(/* webpackChunkName: "dynamic" */ './dynamic').then((bar) => {
  console.log(foo, bar);
});

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(`Hello, world!`);
});

server.listen(process.env.PORT, () => {
  console.log(`SSR server running at http://localhost:${process.env.PORT}/`);
});
