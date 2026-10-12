import { useEffect, useState } from 'react';

export interface DemoResponse {
  name: string;
  source: 'server' | 'client';
  delay: number;
  startedAt: number;
  finishedAt: number;
}

export interface DemoRequestParams {
  name: string;
  delay: number;
  /**
   * Respond with an error with this status code
   */
  failStatus?: number;
}

export interface ClientCall {
  name: string;
  /**
   * Milliseconds since navigation start
   */
  at: number;
}

declare global {
  interface Window {
    // shared between host and child-app bundles
    __RQ_DEMO_CALLS?: ClientCall[];
  }
}

const CALL_EVENT = 'rq-demo-call';
const isServer = typeof window === 'undefined';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const recordCall = (name: string) => {
  if (isServer) {
    console.log(`[fake-api] server request "${name}"`);
    return;
  }

  window.__RQ_DEMO_CALLS = window.__RQ_DEMO_CALLS ?? [];
  window.__RQ_DEMO_CALLS.push({ name, at: Math.round(performance.now()) });
  window.dispatchEvent(new Event(CALL_EVENT));
};

/**
 * In-process fake of a slow backend. Every client-side call is logged,
 * so duplicated requests (server + client) are visible on the page.
 */
export async function fakeRequest({
  name,
  delay,
  failStatus,
}: DemoRequestParams): Promise<DemoResponse> {
  const startedAt = Date.now();

  recordCall(name);

  await sleep(delay);

  if (failStatus) {
    throw Object.assign(new Error(`"${name}" failed with status ${failStatus}`), {
      status: failStatus,
    });
  }

  return {
    name,
    source: isServer ? 'server' : 'client',
    delay,
    startedAt,
    finishedAt: Date.now(),
  };
}

export const useClientCalls = (): ClientCall[] => {
  // empty on server and on hydration render, to avoid hydration mismatch
  const [calls, setCalls] = useState<ClientCall[]>([]);

  useEffect(() => {
    const update = () => setCalls([...(window.__RQ_DEMO_CALLS ?? [])]);

    update();
    window.addEventListener(CALL_EVENT, update);

    return () => window.removeEventListener(CALL_EVENT, update);
  }, []);

  return calls;
};
