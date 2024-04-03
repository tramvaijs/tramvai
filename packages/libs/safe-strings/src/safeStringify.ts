import { encodeForJSContext } from './encodeForJSContext';

/**
 * Stringify object and encode possible XSS and breaking code symbols for insertion result into script tag
 */
export const safeStringify = (json: any): string => {
  return encodeForJSContext(JSON.stringify(json));
};
