declare global {
  interface Window {
    __transportACalls: Array<{ eventName: string; payload: Record<string, any> }>;
  }
}

export function transportAFactory() {
  window.__transportACalls = [];

  return function transportA(eventName: string, payload: Record<string, any>) {
    window.__transportACalls.push({ eventName, payload });
  };
}
