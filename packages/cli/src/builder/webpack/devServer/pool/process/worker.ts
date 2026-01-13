import { installServerWrapper, requireFromString, warmupWorker } from '../base/worker';

installServerWrapper((port) => {
  process.send({ cmd: 'listen', port });
});

process.on('message', ({ filename, script }) => {
  try {
    requireFromString(script, filename);
  } catch (err) {
    console.error(err);
  }
});

warmupWorker();
