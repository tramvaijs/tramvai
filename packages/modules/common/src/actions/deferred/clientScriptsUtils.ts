import { safeStringify, serializeError } from '@tramvai/safe-strings';

export const generateDeferredResolve = ({ key, data }: { key: string; data: any }): string => {
  return `window.__TRAMVAI_DEFERRED_ACTIONS['${key}'].resolve(${safeStringify(data)});`;
};

export const generateDeferredReject = ({ key, error }: { key: string; error: Error }): string => {
  return `window.__TRAMVAI_DEFERRED_ACTIONS['${key}'].reject(${safeStringify(
    serializeError(error)
  )});`;
};
