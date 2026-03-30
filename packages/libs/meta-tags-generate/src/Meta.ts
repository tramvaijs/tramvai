import identity from '@tinkoff/utils/function/identity';
import isArray from '@tinkoff/utils/is/array';
import has from '@tinkoff/utils/object/has';

import { MetaWalk } from './MetaWalk';
import type {
  TagRecord,
  ListSources,
  TransformValue,
  Converter,
  TagValue,
  TagPlacement,
  JsonLdValue,
} from './Meta.h';
import { getTagPlacement } from './utils/getTagPlacement';

const defaultConverter = (value: JsonLdValue | TagValue): TagRecord | null =>
  has('tag', value) ? (value as TagRecord) : null;

export class Meta {
  private listSources: ListSources;

  private transformValue: TransformValue;

  private converters: Record<string, Converter>;

  metaWalk: MetaWalk;

  constructor({
    list,
    transformValue = identity,
    converters = {},
    metaWalk,
  }: {
    list: ListSources;
    transformValue?: TransformValue;
    converters?: Record<string, Converter>;
    metaWalk?: MetaWalk;
  }) {
    this.listSources = list;
    this.transformValue = transformValue;
    this.converters = converters;

    this.metaWalk = metaWalk ?? new MetaWalk();
  }

  dataCollection(placement?: TagPlacement) {
    this.listSources.map((fn) => fn(this.metaWalk));

    let result: TagRecord[] = [];

    this.metaWalk.eachMeta((val, key) => {
      if (val.value !== null) {
        const value = this.transformValue(val);
        const converter = this.converters[key];
        const res = (converter || defaultConverter)(value.value);

        if (res) {
          result = result.concat(isArray(res) ? res.filter(identity) : res);
        }
      }
    });

    if (placement) {
      return result.filter((tag) => getTagPlacement(tag) === placement);
    }

    return result;
  }
}
