import { createToken } from '@tinkoff/dippy';
import type { Navigation } from '@tinkoff/router';

export type AutoscrollBehavior = 'smooth' | 'instant' | 'auto';

export const AUTOSCROLL_BEHAVIOR_MODE_TOKEN = createToken<
  AutoscrollBehavior | ((defaultBehavior: AutoscrollBehavior) => AutoscrollBehavior)
>('autoscroll behavior');

export const AUTOSCROLL_SCROLL_TOP_TOKEN = createToken<
  number | ((defaultScrollTop: number, isRestoredValue: boolean) => number)
>('autoscroll scroll top');

export const AUTOSCROLL_DISABLED_TOKEN =
  createToken<() => boolean | undefined>('autoscroll disabled');

export const AUTOSCROLL_APPPLIED_NAVIGATIONS_TOKEN = createToken<
  Map<
    number,
    {
      href: string;
      scrollTop: number;
    }
  >
>('autoscroll applied navigations');
