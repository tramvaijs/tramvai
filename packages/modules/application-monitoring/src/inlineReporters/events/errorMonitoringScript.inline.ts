export const errorMonitoringScript = (payload: { [x: string]: any }) => {
  const errors = [];
  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const tag = event && (event.target as HTMLScriptElement | HTMLLinkElement | null);
      const tagName = tag && tag.tagName && tag.tagName.toLowerCase();

      if (!tag || (tagName !== 'link' && tagName !== 'script')) {
        return;
      }

      if (event?.error?.retry === 'success') {
        return;
      }

      if (!tag.dataset.critical && !tag.dataset.webpack) {
        return;
      }

      errors.push(event);
    },
    true
  );

  window.addEventListener('load', () => {
    let eventName: string | null = null;
    if (errors.length > 0) {
      eventName = 'assets-load-failed';
    } else {
      eventName = 'assets-loaded';
    }
    window.__TRAMVAI_INLINE_REPORTER?.send?.(eventName, { ...payload });
  });
};
