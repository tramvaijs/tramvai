import { uaParserExtensions } from '../constants';
import { UAParserExtensionsTypes } from '../types';

export const mergeExtensions = (
  extensions?: UAParserExtensionsTypes[]
): UAParserExtensionsTypes | undefined => {
  if (!extensions?.length) {
    return {
      browser: [...uaParserExtensions],
    };
  }

  const merged = extensions.reduce<UAParserExtensionsTypes>(
    (acc, curr) => ({
      browser: [...(acc.browser || []), ...(curr.browser || [])],
      os: [...(acc.os || []), ...(curr.os || [])],
      device: [...(acc.device || []), ...(curr.device || [])],
      engine: [...(acc.engine || []), ...(curr.engine || [])],
    }),
    {}
  );

  return {
    ...merged,
    browser: [...(merged.browser || []), ...uaParserExtensions],
  };
};
