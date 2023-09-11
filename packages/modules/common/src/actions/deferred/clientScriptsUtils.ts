import { safeStringifyJSON, serializeError } from '@tramvai/safe-strings';

export const generateDeferredResolve = ({ key, data }: { key: string; data: any }): string => {
  return `window.__TRAMVAI_DEFERRED_ACTIONS['${key}'].resolve(${safeStringifyJSON(data)});`;
};

export const generateDeferredReject = ({ key, error }: { key: string; error: Error }): string => {
  return `window.__TRAMVAI_DEFERRED_ACTIONS['${key}'].reject(${safeStringifyJSON(
    serializeError(error)
  )});`;
};
