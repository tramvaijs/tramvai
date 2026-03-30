import isEmpty from '@tinkoff/utils/is/empty';
import eachObj from '@tinkoff/utils/object/each';

import type { JsonLdValue, MetaObj, OptionalTagValue, SerializableMetaWalkState } from './Meta.h';

export type WalkItem = { value: JsonLdValue | OptionalTagValue; priority: number };

export class MetaWalk {
  state: Map<string, WalkItem>;

  constructor() {
    this.state = new Map();
  }

  eachMeta(func: (value: WalkItem, key: string) => void) {
    this.state.forEach((value, key) => func(value, key));
  }

  private updateStateByPriority(name: string, walkItem: WalkItem) {
    const currentMetaStateByName = this.state.get(name);

    if (!currentMetaStateByName || walkItem.priority >= currentMetaStateByName.priority) {
      this.state.set(name, walkItem);
    }
  }

  updateMeta<const M extends MetaObj<M>>(priority: number, metaObj: M) {
    eachObj((value, name) => {
      if (value !== null && (!value || isEmpty(value))) {
        return;
      }

      this.updateStateByPriority(name as string, { value, priority });
    }, metaObj);

    return this;
  }

  get(key: string) {
    return this.state.get(key);
  }

  reset() {
    this.state.clear();
  }

  getSerializableState(): SerializableMetaWalkState {
    return Array.from(this.state.entries());
  }

  mergeValuesFromSerializableState(serializableState: SerializableMetaWalkState) {
    serializableState.forEach(([name, walkItem]) => {
      this.updateStateByPriority(name, walkItem);
    });
  }
}
