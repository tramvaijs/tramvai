import { BACKWARD_COMPATIBILITY_OS_NAME } from '../constants';

export const getBackwardCompatibleOsName = (payload: string | undefined): string | undefined => {
  if (payload === undefined) {
    return undefined;
  }
  return BACKWARD_COMPATIBILITY_OS_NAME[payload] ?? payload;
};
