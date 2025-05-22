import { DeviceType } from '../constants';
import { DeviceType as DeviceTypeType } from '../types';

export const BROWSERS_LIST_MAP: {
  [key: string]: {
    type: DeviceTypeType | 'any';
    name: string;
  };
} = {
  chrome: {
    type: DeviceType.desktop,
    name: 'chrome',
  },
  safari: {
    type: DeviceType.desktop,
    name: 'safari',
  },
  firefox: {
    type: DeviceType.desktop,
    name: 'firefox',
  },
  opera: {
    type: DeviceType.desktop,
    name: 'opera',
  },
  ie: {
    type: DeviceType.desktop,
    name: 'ie',
  },
  edge: {
    type: 'any',
    name: 'edge',
  },
  and_chr: {
    type: DeviceType.mobile,
    name: 'chrome',
  },
  ios_saf: {
    type: DeviceType.mobile,
    name: 'mobile safari',
  },
  android: {
    type: DeviceType.mobile,
    name: 'android browser',
  },
  op_mob: {
    type: DeviceType.mobile,
    name: 'opera',
  },
  and_uc: {
    type: DeviceType.mobile,
    name: 'ucbrowser',
  },
  and_ff: {
    type: DeviceType.mobile,
    name: 'firefox',
  },
  samsung: {
    type: DeviceType.mobile,
    name: 'samsung browser',
  },
};

export const CHROMIUM_BASED_BROWSERS = [
  'android browser',
  'yandex',
  'blink',
  'vivaldi' /* , 'chrome webview', 'opera', 'samsung' */,
];

export const DEVICE_TYPES: Record<string, string> = {
  mobile: DeviceType.mobile,
  tablet: DeviceType.mobile, // We consider tablets to be mobile devices because they have mobile browsers installed.
  desktop: DeviceType.desktop,
};

export const BROWSERS_WITHOUT_COMPLETE_STAT = {
  Samsung: 'samsung',
  Android: 'android',
  UCAndroid: 'and_uc',
  OperaMobile: 'op_mob',
};
