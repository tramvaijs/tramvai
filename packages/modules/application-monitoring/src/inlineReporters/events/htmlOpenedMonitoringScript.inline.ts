export const htmlOpenedMonitoringScript = (payload: { [x: string]: any }) => {
  window.__TRAMVAI_INLINE_REPORTER?.send?.('html-opened', { ...payload });
};
