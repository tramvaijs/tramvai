import { createToken } from '@tinkoff/dippy';

export type AutoscrollBehavior = 'smooth' | 'auto';

export const AUTOSCROLL_BEHAVIOR_MODE_TOKEN = createToken<
  AutoscrollBehavior | (() => AutoscrollBehavior)
>('autoscroll behavior');
export const AUTOSCROLL_SCROLL_TOP_TOKEN = createToken<number | (() => number)>(
  'autoscroll scroll top'
);
