import { run } from '@tramvai/tools-migrate';
import type { Context } from '../../../models/context';

export const migrate = async (context: Context) => {
  try {
    await run();
  } catch (e) {
    throw new Error('Migrations failed');
  }
};
