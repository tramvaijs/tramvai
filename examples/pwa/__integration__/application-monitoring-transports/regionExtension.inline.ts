export function regionExtensionFactory() {
  return function regionExtension(eventName: string, payload: Record<string, any>) {
    if (eventName !== 'html-opened') {
      return payload;
    }
    return { ...payload, regionId: 'region-test-123' };
  };
}
