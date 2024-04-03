import type { CommandLineDescription } from '@tramvai/core';
import { commandLineListTokens } from '@tramvai/core';

const command: CommandLineDescription = {
  init: [commandLineListTokens.init, commandLineListTokens.listen],
  close: [commandLineListTokens.close],
  customer: [
    commandLineListTokens.customerStart,
    commandLineListTokens.resolveUserDeps,
    commandLineListTokens.resolvePageDeps,
    commandLineListTokens.generatePage,
    commandLineListTokens.clear,
  ],
  spa: [
    commandLineListTokens.resolveUserDeps,
    commandLineListTokens.resolvePageDeps,
    commandLineListTokens.spaTransition,
  ],
  afterSpa: [commandLineListTokens.afterSpaTransition],
};

export const lines = {
  server: command,
  client: command,
};
