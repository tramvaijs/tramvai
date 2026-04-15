export const errorMonitoringScript = (payload: { [x: string]: any }) => {
  const errors: ErrorEvent[] = [];

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const tag = event && (event.target as HTMLScriptElement | HTMLLinkElement | null);
      const tagName = tag && tag.tagName && tag.tagName.toLowerCase();

      // cleanup errors for successfully retried assets
      if (event?.error?.retry === 'success') {
        [...errors].forEach((e, index) => {
          const failedTag = e.target as HTMLScriptElement | HTMLLinkElement;
          const isLink = failedTag.tagName.toLowerCase() === 'link';
          const failedUrl = isLink
            ? (failedTag as HTMLLinkElement).href
            : (failedTag as HTMLScriptElement).src;

          if (failedUrl === event?.error?.originalUrl) {
            errors.splice(index, 1);
          }
        });
        return;
      }
      if (!tag || (tagName !== 'link' && tagName !== 'script')) {
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

    window.__TRAMVAI_INLINE_REPORTER?.send?.(
      eventName,
      errors.length > 0
        ? { ...payload, error: errors[0], otherErrors: errors.slice(1) }
        : { ...payload }
    );
  });
};
