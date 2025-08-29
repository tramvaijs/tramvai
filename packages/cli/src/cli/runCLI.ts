import exit from 'exit';

import { fixYarnSettingsOverride } from '../utils/fixYarnSettingsOverride';
import { handleErrors } from '../utils/handleErrors';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __TRAMVAI_EXIT_HANDLERS__: Array<() => Promise<any>>;
}

// to use V8's code cache to speed up instantiation time
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
import('v8-compile-cache');

handleErrors();
fixYarnSettingsOverride();

if (process.env.TRAMVAI_CPU_PROFILE) {
  const { enableCpuProfile } = require('../utils/cpu-profile');
  enableCpuProfile('tramvai-cli');
}

export default (pathCli: string) => {
  const cli = require(pathCli).cliInitialized;

  async function runExitHandlersAndQuit(code: number) {
    if (global.__TRAMVAI_EXIT_HANDLERS__) {
      const handlers = [...global.__TRAMVAI_EXIT_HANDLERS__];
      const promise = Promise.allSettled(handlers.map((handler) => handler()));

      // prevent multiple calls to exit handlers, wait the same handlers if they are already running
      global.__TRAMVAI_EXIT_HANDLERS__ = [() => promise];

      await promise;
    }
    exit(code);
  }

  process.on('SIGINT', async () => runExitHandlersAndQuit(0));
  process.on('SIGTERM', async () => runExitHandlersAndQuit(0));

  return cli()
    .then(async () => {
      await runExitHandlersAndQuit(0);
    })
    .catch(async () => {
      await runExitHandlersAndQuit(1);
    });
};
