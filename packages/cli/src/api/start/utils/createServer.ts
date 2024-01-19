import { createServer as httpCreateServer } from 'http';
import { createServer as httpsCreateServer } from 'https';
import { readFileSync } from 'fs';
import stoppable from 'stoppable';
import type { Certificate } from '../../shared/types/base';

const createHttpsServer = ({ keyPath, certificatePath }: Certificate) => {
  const options = {
    key: readFileSync(keyPath),
    cert: readFileSync(certificatePath),
  };
  const httpsServer = httpsCreateServer(options);
  return stoppable(httpsServer, 0);
};

const createHttpServer = () => {
  const server = httpCreateServer();

  return stoppable(server, 0);
};

export const createServer = (certificate?: Certificate) => {
  return certificate && certificate?.certificatePath && certificate?.keyPath
    ? createHttpsServer(certificate)
    : createHttpServer();
};
