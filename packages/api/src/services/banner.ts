import { createToken } from '@tinkoff/dippy';

export const SHOW_BANNER_TOKEN = createToken<() => void>('tramvai show banner');
