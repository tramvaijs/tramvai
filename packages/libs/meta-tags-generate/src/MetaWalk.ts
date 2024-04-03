import eachObj from '@tinkoff/utils/object/each';
import type { SerializableMetaWalkState, TagRecord } from './Meta.h';

export type WalkItem = { value: string | TagRecord | null; priority: number };

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

  updateMeta(priority: number, metaObj: Record<string, string | TagRecord | null>) {
    eachObj((value, name) => {
      if (!value && value !== null) {
        return;
      }
      this.updateStateByPriority(name, { value, priority });
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
