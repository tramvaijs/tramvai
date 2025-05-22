import { MobileOs } from '../constants';

/**
 * Possible values:
 * winphone, android, ios, blackberry
 *
 * The return type here should be MobileOs, not string | undefined,
 * but we are not changing it to maintain backward compatibility.
 */
export const getMobileOs = (osName?: string): string | undefined => {
  switch (osName) {
    case 'Windows Phone':
      return MobileOs.winphone;
    case 'Android':
      return MobileOs.android;
    case 'iOS':
      return MobileOs.ios;
    case 'BlackBerry':
    case 'RIM Tablet OS':
      return MobileOs.blackberry;
  }
};
