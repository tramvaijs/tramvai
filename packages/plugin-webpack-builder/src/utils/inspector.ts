import inspector from 'node:inspector';

if (process.env.INSPECT_WORKER_THREAD === 'break') {
  inspector.open(Number(process.env.INSPECT_WORKER_THREAD_PORT));
  inspector.waitForDebugger();
}
