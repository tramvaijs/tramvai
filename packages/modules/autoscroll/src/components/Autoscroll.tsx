import { memo, useMemo, useRef } from 'react';
import { useRoute, useUrl, useViewTransition } from '@tramvai/module-router';
import { optional } from '@tinkoff/dippy';
import { useDi } from '@tramvai/react';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { useIsomorphicLayoutEffect } from '@tinkoff/react-hooks';
import { AUTOSCROLL_BEHAVIOR_MODE_TOKEN, AUTOSCROLL_SCROLL_TOP_TOKEN } from '../tokens';

const DEFAULT_AUTOSCROLL_BEHAVIOR = 'smooth';
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
export const Autoscroll = memo(() => {
  const route = useRoute();
  const url = useUrl();
  const { isTransitioning } = useViewTransition(url.pathname);
  const scrollBehaviorFactory =
    useDi(optional(AUTOSCROLL_BEHAVIOR_MODE_TOKEN)) ?? DEFAULT_AUTOSCROLL_BEHAVIOR;
  const scrollTopFactory =
    useDi(optional(AUTOSCROLL_SCROLL_TOP_TOKEN)) ?? DEFAULT_AUTOSCROLL_SCROLL_TOP;
  const logger = useDi(LOGGER_TOKEN);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const log = useMemo(() => logger('autoscroll'), []);
  const previousUrl = useRef(url);
  const shouldScroll = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (url.pathname !== previousUrl.current.pathname || url.hash !== previousUrl.current.hash) {
      shouldScroll.current = true;
    }
    // skip unnecessary checks, if url has not changed and shouldScroll.current set to false - we don't need to scroll
    if (!shouldScroll.current) {
      return;
    }
    // when VT is enabled, we will have a two re-renderw with `isTransitioning: true` (with current and next url),
    // and only after that `isTransitioning` will be false and url will be updated to the next one.
    if (isTransitioning) {
      return;
    }
    // disable autoscroll for current page if `disableAutoscroll` is set in route history state
    if (route.navigateState?.disableAutoscroll) {
      previousUrl.current = url;
      shouldScroll.current = false;
      log.debug('Skipping autoscroll because "disableAutoscroll" is set in route history state');
      return;
    }

    previousUrl.current = url;
    shouldScroll.current = false;

    const scrollBehavior =
      route.navigateState?.autoscrollBehavior ??
      (typeof scrollBehaviorFactory === 'function'
        ? scrollBehaviorFactory()
        : scrollBehaviorFactory);
    const scrollTop =
      typeof scrollTopFactory === 'function' ? scrollTopFactory() : scrollTopFactory;

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
  }, [route, url, isTransitioning]);

  return null;
});
