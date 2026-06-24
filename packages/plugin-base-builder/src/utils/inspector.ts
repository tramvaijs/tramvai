import inspector from 'node:inspector';

if (process.env.INSPECT_WORKER_THREAD) {
  inspector.open(Number(process.env.INSPECT_WORKER_THREAD_PORT));

  if (process.env.INSPECT_WORKER_THREAD === 'break') {
    inspector.waitForDebugger();
  }
}
