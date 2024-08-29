import propOr from '@tinkoff/utils/object/propOr';
import type { Request } from '@tinkoff/request-core';
import createRequest from '@tinkoff/request-core';
import http from '@tinkoff/request-plugin-protocol-http';
import retry from '@tinkoff/request-plugin-retry';
import type { ConfigManager } from '../../config/configManager';

const request = createRequest([retry(), http()]);

export const appRequest = <T>(configManager: ConfigManager, path: string, options?: Request) => {
  const { host, port } = configManager;
  const serverPath = `http://${host}:${port}`;

  return request<T>({ url: `${serverPath}${path}`, ...options });
};

interface BundleInfoResponse {
  resultCode: string;
  payload: string[];
}

export const appBundleInfo = async (configManager: ConfigManager) => {
  const { name } = configManager;

  const response = await appRequest<BundleInfoResponse>(configManager, `/${name}/papi/bundleInfo`, {
    timeout: 5000,
    retry: 3,
  });

  return propOr('payload', [], response);
};
