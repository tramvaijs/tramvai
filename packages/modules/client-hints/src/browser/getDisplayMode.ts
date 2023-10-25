export const getDisplayMode = () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }

  if (window.matchMedia('(display-mode: browser)').matches) {
    return 'browser';
  }

  return 'unknown';
};
