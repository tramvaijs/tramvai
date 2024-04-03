import debounce from '@tinkoff/utils/function/debounce';
import type { CONTEXT_TOKEN } from '@tramvai/tokens-common';
import type { COOKIE_MANAGER_TOKEN } from '@tramvai/tokens-cookie';
import type { MediaInfo } from '../types';
import { setMedia } from '../shared/stores/media';
import { COOKIE_NAME_MEDIA_INFO } from '../shared/constants';
import { mediaBreakpoints } from '../shared/mediaBreakpoints';
import { getDisplayMode } from './getDisplayMode';
import { requestIdleCallback } from './requestIdleCallback';

declare global {
  interface Window {
    DocumentTouch?: any;
  }
}

const isTouch = !!(
  'ontouchstart' in window ||
  (window.DocumentTouch && document instanceof window.DocumentTouch)
);

const displayMode = getDisplayMode();

const getMediaInfo = (): MediaInfo => ({
  width: window.innerWidth,
  height: window.innerHeight,
  isTouch,
  displayMode,
  retina: window.matchMedia(mediaBreakpoints.retina).matches,
});

export const matchMediaCommand = ({
  context,
  cookieManager,
}: {
  context: typeof CONTEXT_TOKEN;
  cookieManager: typeof COOKIE_MANAGER_TOKEN;
}) => {
  return function matchMedia() {
    const setMediaInfo = () => {
      const media = getMediaInfo();

      cookieManager.set({
        name: COOKIE_NAME_MEDIA_INFO,
        value: JSON.stringify(media),
      });

      // TCORE-4601 - React hydration error (421) caused when media store updated before hydration is finished,
      // in cases when media store passed to components inside Suspense boundaries.
      // Recipe from https://github.com/reactwg/react-18/discussions/5
      return requestIdleCallback(() =>
        context.dispatch(
          setMedia({
            ...media,
            supposed: false,
          })
        )
      );
    };

    const debouncedSetMediaInfo = debounce(300, setMediaInfo);

    window.addEventListener('orientationchange', debouncedSetMediaInfo);

    window.addEventListener('resize', debouncedSetMediaInfo);

    return setMediaInfo();
  };
};
