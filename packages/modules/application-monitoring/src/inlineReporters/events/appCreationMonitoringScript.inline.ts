export const appCreationMonitoringScript = (payload: { [x: string]: any }) => {
  window.addEventListener(
    'unhandledrejection',
    //@ts-expect-error
    (event: PromiseRejectionEvent & { detail: unknown }) => {
      const eventName = 'unhandled-error';
      window.__TRAMVAI_INLINE_REPORTER?.send?.(eventName, { ...event, ...payload });
    },
    true
  );
};
