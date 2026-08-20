import type { DeferredActionsMap } from '@tramvai/tokens-common';
import type { CHILD_APP_INTERNAL_CONFIG_TOKEN } from '@tramvai/tokens-child-app';

const KEY_SEP = '__';
const HOST_SCOPE = 'host';

export function getPrefix(childAppConfig?: typeof CHILD_APP_INTERNAL_CONFIG_TOKEN | null): string {
  return childAppConfig?.key ?? HOST_SCOPE;
}

export function getDeferredKey(
  name: string,
  childAppConfig?: typeof CHILD_APP_INTERNAL_CONFIG_TOKEN | null
): string {
  return `${getPrefix(childAppConfig)}${KEY_SEP}${name}`;
}

export function createDeferredMap(rootMap: DeferredActionsMap, scope?: string): DeferredActionsMap {
  const prefix = `${scope ?? HOST_SCOPE}${KEY_SEP}`;

  return {
    get(name) {
      return rootMap.get(prefix + name);
    },
    set(name, value) {
      rootMap.set(prefix + name, value);
    },
    has(name) {
      return rootMap.has(prefix + name);
    },
    forEach(callback) {
      rootMap.forEach((value, fullKey) => {
        if (fullKey.startsWith(prefix)) {
          callback(value, fullKey.slice(prefix.length));
        }
      });
    },
  };
}
