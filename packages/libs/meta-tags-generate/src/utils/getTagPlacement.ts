import type { TagRecord, TagPlacement } from '../Meta.h';

export const getTagPlacement = (tagRecord: TagRecord): TagPlacement => {
  if (tagRecord.tag === 'script' && tagRecord.attributes?.type === 'application/ld+json') {
    return 'body';
  }
  return 'head';
};
