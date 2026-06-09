import { memo, useMemo, useRef } from 'react';
import { useRouter, useRoute, useUrl } from '@tramvai/module-router';
import { optional } from '@tinkoff/dippy';
import { useDi } from '@tramvai/react';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { useIsomorphicLayoutEffect } from '@tinkoff/react-hooks';
import {
  AUTOSCROLL_BEHAVIOR_MODE_TOKEN,
  AUTOSCROLL_SCROLL_TOP_TOKEN,
  AUTOSCROLL_DISABLED_TOKEN,
  AUTOSCROLL_APPPLIED_NAVIGATIONS_TOKEN,
} from '../tokens';

const DEFAULT_AUTOSCROLL_BEHAVIOR =
  process.env.__TRAMVAI_REACT_TRANSITIONS === 'true' ? 'instant' : 'smooth';
const DEFAULT_SCROLL_RESTORATION_BEHAVIOR = 'instant';
const DEFAULT_AUTOSCROLL_SCROLL_TOP = 0;

const scrollToTop = (behavior: ScrollBehavior, top: number) => {
  // cross-browser `window.scrollTo` parameters
  try {
    window.scrollTo({ top, left: 0, behavior });
  } catch (error) {
    window.scrollTo(0, top);
  }
};

const scrollToAnchor = (anchor: string, behavior: ScrollBehavior): boolean => {
  try {
    document.querySelector(anchor)?.scrollIntoView({
      behavior,
    });

    return true;
  } catch {
    return false;
  }
};

// @reference https://reacttraining.com/react-router/web/guides/scroll-restoration/scroll-to-top
export const ScrollRestoration = memo(() => {
  const router = useRouter();
  const route = useRoute();
  const url = useUrl();
  const scrollBehaviorFactory = useDi(optional(AUTOSCROLL_BEHAVIOR_MODE_TOKEN));
  const scrollTopFactory = useDi(optional(AUTOSCROLL_SCROLL_TOP_TOKEN));
  const autoscrollDisabledFactory = useDi(optional(AUTOSCROLL_DISABLED_TOKEN));
  const appliedNavigations = useDi(AUTOSCROLL_APPPLIED_NAVIGATIONS_TOKEN);
  const logger = useDi(LOGGER_TOKEN);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const log = useMemo(() => logger('autoscroll'), []);
  const previousUrl = useRef(url);
  const shouldScroll = useRef(true);
  // workaround to restore scroll position on page reload instantly
  const initialScrollRestoration = useRef(true);

  // eslint-disable-next-line max-statements
  useIsomorphicLayoutEffect(() => {
    if (
      url.pathname !== previousUrl.current.pathname ||
      url.hash !== previousUrl.current.hash ||
      url.search !== previousUrl.current.search
    ) {
      shouldScroll.current = true;
    }
    // skip unnecessary checks, if url has not changed and shouldScroll.current set to false - we don't need to scroll
    if (!shouldScroll.current) {
      return;
    }

    const autoscrollDisabled =
      typeof autoscrollDisabledFactory === 'function'
        ? autoscrollDisabledFactory()
        : autoscrollDisabledFactory;

    // disable autoscroll for current page if `disableAutoscroll` is set in route history state
    if (autoscrollDisabled ?? route.navigateState?.disableAutoscroll) {
      previousUrl.current = url;
      shouldScroll.current = false;

      if (typeof autoscrollDisabled === 'boolean') {
        log.debug('Skipping autoscroll because "AUTOSCROLL_DISABLED_TOKEN" is return true');
      } else {
        log.debug('Skipping autoscroll because "disableAutoscroll" is set in navigation state');
      }

      log.debug('Enable browser scroll restoration to handle scroll position automatically');
      window.history.scrollRestoration = 'auto';

      return;
    }

    log.debug('Disabling browser scroll restoration to handle scroll position manually');
    window.history.scrollRestoration = 'manual';

    previousUrl.current = url;
    shouldScroll.current = false;

    const navigationIndex = (router as any).history.getCurrentState()?.index;

    const scrollRestoredPosition =
      appliedNavigations.has(navigationIndex) &&
      // if url was changed with replace: true navigation
      appliedNavigations.get(navigationIndex)!.href === url.href &&
      appliedNavigations.get(navigationIndex)!.scrollTop;
    const isRestoredScrollPosition = typeof scrollRestoredPosition === 'number';

    const scrollTopDefault = isRestoredScrollPosition
      ? scrollRestoredPosition
      : DEFAULT_AUTOSCROLL_SCROLL_TOP;
    const scrollTopFromFactory =
      typeof scrollTopFactory === 'function'
        ? scrollTopFactory(scrollTopDefault, isRestoredScrollPosition)
        : scrollTopFactory;
    const scrollTop = scrollTopFromFactory ?? scrollTopDefault;

    const scrollBehaviorDefault =
      initialScrollRestoration.current || isRestoredScrollPosition
        ? DEFAULT_SCROLL_RESTORATION_BEHAVIOR
        : DEFAULT_AUTOSCROLL_BEHAVIOR;
    const scrollBehaviorFromFactory =
      typeof scrollBehaviorFactory === 'function'
        ? scrollBehaviorFactory(scrollBehaviorDefault)
        : scrollBehaviorFactory;
    const scrollBehavior = scrollBehaviorFromFactory ?? scrollBehaviorDefault;

    if (isRestoredScrollPosition) {
      if (initialScrollRestoration.current) {
        log.debug(
          `Restoring scroll position ${scrollRestoredPosition}px with instant behavior due to page reload`
        );
      } else {
        log.debug(
          `Restoring scroll position ${scrollRestoredPosition}px for navigation index ${navigationIndex}`
        );
      }
    }

    if (initialScrollRestoration.current) {
      initialScrollRestoration.current = false;
    }

    function scroll() {
      if (!url.hash) {
        log.debug(`Scrolling to top ${scrollTop}px with behavior: ${scrollBehavior}`);
        scrollToTop(scrollBehavior, scrollTop);
      } else {
        log.debug(`Scrolling to anchor ${url.hash} with behavior: ${scrollBehavior}`);
        scrollToAnchor(url.hash, scrollBehavior);
      }
    }

    scroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, route, url]);

  return null;
});
