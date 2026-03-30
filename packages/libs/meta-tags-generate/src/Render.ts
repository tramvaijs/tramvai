import reduceObj from '@tinkoff/utils/object/reduce';

import { META_DATA_ATTR } from './constants';
import type { Meta } from './Meta';
import type { TagRecord, TagPlacement } from './Meta.h';

const formatAttr = reduceObj((acc, value, key) => `${acc} ${key}="${value}"`, '');

const htmlConverter = ({ tag, attributes, innerHtml }: TagRecord) => {
  const attr = `${formatAttr(attributes)} ${META_DATA_ATTR}="true"`;

  if (innerHtml) {
    return `<${tag}${attr}>${innerHtml}</${tag}>`;
  }

  return `<${tag}${attr}>`;
};

export class Render {
  meta: Meta;

  constructor(meta: Meta) {
    this.meta = meta;
  }

  render(options?: { placement?: TagPlacement }): string {
    const { placement = 'head' } = options ?? {};

    return this.meta.dataCollection(placement).map(htmlConverter).join('\n');
  }
}
