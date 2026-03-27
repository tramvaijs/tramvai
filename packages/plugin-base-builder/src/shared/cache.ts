import { createToken } from '@tinkoff/dippy';

export const CACHE_ADDITIONAL_FLAGS_TOKEN = createToken<string[]>(
  'tramvai build cache additional flags',
  { multi: true }
);
