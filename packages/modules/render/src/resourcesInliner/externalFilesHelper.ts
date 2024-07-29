import fetch from 'node-fetch';

const thirtySeconds = 1000 * 30;

export const getFileContentLength = async (url: string): Promise<string> => {
  const info = await fetch(url, {
    method: 'HEAD',
    timeout: thirtySeconds,
    headers: { 'x-tramvai-service-name': 'RESOURCE_INLINER' },
  });
  return info.headers.get('content-length');
};

export const getFile = async (url: string): Promise<string | undefined> => {
  const fileResponse = await fetch(url, {
    timeout: thirtySeconds,
    headers: { 'x-tramvai-service-name': 'RESOURCE_INLINER' },
  });

  if (fileResponse.ok) {
    const file = await fileResponse.text();
    return file;
  }

  return undefined;
};
