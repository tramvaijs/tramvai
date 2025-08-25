// import fs from 'node:fs';
// import path from 'node:path';
// import module from 'node:module';
// import findCacheDir from 'find-cache-dir';

// const cacheDir = findCacheDir({ cwd: process.cwd(), create: true, name: 'node-compile-cache' });
// TODO: it is profitable?
// module.enableCompileCache(cacheDir);

require('@tramvai/api/lib/utils/cpu-profile');
const { tracer } = require('@tramvai/api/lib/services/tracer');

tracer.init();

// time between "cli.run" and "start-command.started" measures the time of script initialization
tracer.mark({
  event: 'cli.run',
  category: ['cli'],
  timestamp: 0,
});

async function main() {
  const { start } = require('@tramvai/api/lib/api/start');

  const devServer = await start({
    name: 'cli-rewrited',
    port: 3000,
    showProgress: true,
    staticPort: 4000,
  });

  process.on('exit', (code) => {
    console.error('wtf START exit', code);

    devServer?.close?.()?.then(() => {
      console.error('wtf START close', code);
      process.exit(code);
    });
  });

  process.on('SIGINT', (signal) => {
    console.error('wtf SIGINT', signal);

    devServer?.close?.()?.then(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', (signal) => {
    console.error('wtf SIGTERM', signal);

    devServer?.close?.()?.then(() => {
      process.exit(0);
    });
  });

  process.on('uncaughtException', (error) => {
    console.error('wtf uncaughtException', error);
    process.exit(0);
  });

  process.on('unhandledRejection', (error) => {
    console.error('wtf unhandledRejection', error);
    process.exit(0);
  });
}

main();
