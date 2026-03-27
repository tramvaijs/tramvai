import { Worker } from 'node:worker_threads';

export function filterWorkerStderr(worker: Worker) {
  // Filter deprecation warning from worker
  worker.stderr.on('data', (chunk: string) => {
    if (chunk.includes('DeprecationWarning:')) {
      return;
    }

    process.stderr.write(chunk);
  });
}
