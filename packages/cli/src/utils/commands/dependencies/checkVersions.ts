import { run } from '@tramvai/tools-check-versions';
import type { Context } from '../../../models/context';

export const checkVersions = async (context: Context) => {
  try {
    await run();
  } catch (e) {
    throw new Error('Versions check failed');
  }
};
