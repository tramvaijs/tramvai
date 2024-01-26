import type { AddressInfo } from 'net';
import type { PromiseType } from 'utility-types';
import type { start } from '@tramvai/cli';

import type { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import type { StartCliOptions } from './startCli';

type CliResult = PromiseType<ReturnType<typeof start>>;
type HttpProtocol = 'https' | 'http';

const extractHttpProtocolFromServerInstance = (server?: HttpServer | HttpsServer): HttpProtocol => {
  if (server instanceof HttpsServer) return 'https';
  return 'http';
};

export const getServerUrl = ({ server }: CliResult) => {
  const { port } = server?.address() as AddressInfo;

  return `${extractHttpProtocolFromServerInstance(server)}://localhost:${port}`;
};

export const getServerDomain = ({ server }: CliResult) => {
  const { port } = server?.address() as AddressInfo;

  return `localhost:${port}`;
};

export const getStaticUrl = ({ staticServer }: CliResult) => {
  const { port } = staticServer?.address() as AddressInfo;

  return `${extractHttpProtocolFromServerInstance(staticServer)}://localhost:${port}`;
};

export const getUtilityServerUrl = (env: StartCliOptions['env'], { server }: CliResult) => {
  const { port } = server?.address() as AddressInfo;

  return `${extractHttpProtocolFromServerInstance(server)}://localhost:${
    env?.UTILITY_SERVER_PORT || port
  }`;
};
