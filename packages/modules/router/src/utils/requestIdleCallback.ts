export const requestIdleCallback =
  // eslint-disable-next-line compat/compat
  window.requestIdleCallback ||
  function (callback: () => void) {
    return window.setTimeout(callback, 1);
  };

export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (timer: number) {
    return window.clearTimeout(timer);
  };
