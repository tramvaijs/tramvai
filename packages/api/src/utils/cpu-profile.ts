import { Session } from 'inspector';
import fs from 'fs';
import { logger } from '../services/logger';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

// reference - https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/cpu-profile.ts
if (process.env.TRAMVAI_CPU_PROFILE) {
  const session = new Session();
  let saved = false;

  session.connect();

  session.post('Profiler.enable');
  session.post('Profiler.start');

  // eslint-disable-next-line no-inner-declarations
  function saveProfile() {
    if (saved) {
      return;
    }
    saved = true;

    const key = process.env.__TRAMVAI_CPU_PROFILE_FILENAME ?? 'tramvai';

    session.post('Profiler.stop', (error, param) => {
      if (error) {
        logger.event({
          type: 'error',
          event: 'cpu-profiler-error',
          message: `Cannot generate ${key} CPU profiling: ${error.message}`,
          payload: { error },
        });
        return;
      }

      // Write profile to disk
      const filename = `${key}.${Date.now()}.cpuprofile`;
      fs.writeFileSync(`./${filename}`, JSON.stringify(param.profile));
    });
  }

  // CLI will wait for this handlers before exiting
  // @reference `packages/cli/src/cli/runCLI.ts`
  if (!global.__TRAMVAI_EXIT_HANDLERS__) {
    global.__TRAMVAI_EXIT_HANDLERS__ = [];
  }

  global.__TRAMVAI_EXIT_HANDLERS__.push(async () => {
    saveProfile();
  });
}
