import identity from '@tinkoff/utils/function/identity';
import ifElse from '@tinkoff/utils/function/ifElse';
import isObject from '@tinkoff/utils/is/object';
import isString from '@tinkoff/utils/is/string';
import has from '@tinkoff/utils/object/has';
import escape from '@tinkoff/utils/string/escape';
import { safeStringify } from '@tramvai/safe-strings';

// Уровень, с которого мы перестаем доверять meta тегам и их необходимо очищать от лишнего
const META_PRIORITY_MIN_SAFE = 10;

const escapeMeta = ifElse(isString, escape, identity);
// Эскейпим пользовательские значения. Возможно XSS атака
export const transformValue = (item) => {
  const { priority, value } = item;

  const isTagRecord = has('tag', value);
  const isObjectValue = isObject(value) && !isTagRecord;

  if (priority <= META_PRIORITY_MIN_SAFE) {
    return isObjectValue ? { priority, value: JSON.stringify(value) } : item;
  }

  return { priority, value: isObjectValue ? safeStringify(value) : escapeMeta(value) };
};
