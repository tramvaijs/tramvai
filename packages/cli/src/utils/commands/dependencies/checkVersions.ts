import type { Context } from '../../../models/context';

export const checkVersions = async (context: Context) => {
  try {
    // for speed up cli startup when versions check is not needed
    const { run } = require('@tramvai/tools-check-versions');

    await run();
  } catch (e) {
    throw new Error('Versions check failed');
  }
};
