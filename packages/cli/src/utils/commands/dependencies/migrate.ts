import type { Context } from '../../../models/context';

export const migrate = async (context: Context) => {
  try {
    // for speed up cli startup when migrations are not needed
    const { run } = require('@tramvai/tools-migrate');

    await run();
  } catch (e) {
    throw new Error('Migrations failed');
  }
};
