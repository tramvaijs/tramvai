declare global {
  interface Window {
    __transportBCalls: Array<{ eventName: string; payload: Record<string, any> }>;
  }
}

export function transportBFactory() {
  window.__transportBCalls = [];

  return function transportB(eventName: string, payload: Record<string, any>) {
    window.__transportBCalls.push({ eventName, payload });
  };
}
