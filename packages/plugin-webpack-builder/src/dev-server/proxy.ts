import http from 'node:http';
import httpProxy from 'http-proxy';

export const createProxy = ({
  port,
  staticPort,
  serverRunnerPort,
  serverBuildPort,
  browserBuildPort,
}: {
  port: number;
  staticPort: number;
  serverRunnerPort: number;
  serverBuildPort: number;
  browserBuildPort: number;
}) => {
  const devProxy = httpProxy.createProxyServer();

  devProxy.on('error', (err, req, res) => {
    // TODO: replace with logger from di?
    // TODO: requests queue for failed builds?
    // eslint-disable-next-line no-console
    console.error('proxy error', err, req.url);
    // @ts-expect-error
    res.statusCode = 500;
    res.end();
  });

  const devServer = http.createServer((req, res) => {
    // TODO: HTML
    devProxy.web(req, res, {
      target: `http://localhost:${serverRunnerPort}`,
    });
  });
  const staticServer = http.createServer((req, res) => {
    if (req.url!.includes('/server.js')) {
      devProxy.web(req, res, {
        target: `http://localhost:${serverBuildPort}`,
      });
    } else {
      devProxy.web(req, res, {
        target: `http://localhost:${browserBuildPort}`,
      });
    }
  });

  return {
    listen: () => {
      devServer.listen(port, () => {
        // TODO: replace with logger from di?
        // eslint-disable-next-line no-console
        console.log(`Development server started at ${port} port`);
      });
      staticServer.listen(staticPort, () => {
        // TODO: replace with logger from di?
        // eslint-disable-next-line no-console
        console.log(`Static server started at ${staticPort} port`);
      });
    },
    close: () => {
      devProxy.close();
      devServer.close();
      staticServer.close();
    },
  };
};
