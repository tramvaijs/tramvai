import http from 'http';
import https from 'https';
import type { Agent, AgentOptions } from 'https';
import requestFactory from '@tinkoff/request-core';
import httpPlugin, { getHeaders } from '@tinkoff/request-plugin-protocol-http';

const options: AgentOptions = {
  keepAlive: true,
  scheduling: 'lifo',
};
const agent = {
  http: new http.Agent(options) as Agent,
  https: new https.Agent(options),
};

const request = requestFactory([httpPlugin({ agent })]);

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
