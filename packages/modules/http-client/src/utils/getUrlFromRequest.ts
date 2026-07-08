import type { HttpClientRequest } from '@tramvai/http-client';

export const getUrlFromRequest = (request: HttpClientRequest): string =>
  request.url ?? (request.baseUrl ? `${request.baseUrl}${request.path}` : (request.path ?? ''));
