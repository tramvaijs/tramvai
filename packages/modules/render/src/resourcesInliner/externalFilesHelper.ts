import requestFactory from '@tinkoff/request-core';
import httpPlugin, { getHeaders } from '@tinkoff/request-plugin-protocol-http';

const request = requestFactory([httpPlugin()]);

const thirtySeconds = 1000 * 30;

export const getFileContentLength = async (url: string): Promise<string | undefined> => {
  const response = request({
    url,
    httpMethod: 'HEAD',
    timeout: thirtySeconds,
    headers: { 'x-tramvai-service-name': 'RESOURCE_INLINER' },
  });

  await response;

  return getHeaders(response)['content-length'] ?? undefined;
};

export const getFile = async (url: string): Promise<string | undefined> => {
  const fileResponse = await request({
    url,
    timeout: thirtySeconds,
    headers: { 'x-tramvai-service-name': 'RESOURCE_INLINER' },
  });

  return fileResponse ?? undefined;
};
