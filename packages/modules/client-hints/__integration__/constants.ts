import type { UserAgent } from '@tinkoff/user-agent';

export const chromeClientHints = {
  architecture: 'arm',
  bitness: '64',
  brands: [
    {
      brand: 'Not.A/Brand',
      version: '8',
    },
    {
      brand: 'Chromium',
      version: '114',
    },
    {
      brand: 'Google Chrome',
      version: '114',
    },
  ],
  fullVersionList: [
    {
      brand: 'Not.A/Brand',
      version: '8.0.0.0',
    },
    {
      brand: 'Chromium',
      version: '114.0.5735.198',
    },
    {
      brand: 'Google Chrome',
      version: '114.0.5735.198',
    },
  ],
  mobile: false,
  model: '',
  platform: 'macOS',
  platformVersion: '13.2.1',
};

export const chromeCHUserAgent: UserAgent = {
  browser: {
    browserEngine: 'chrome',
    major: '114',
    name: 'chrome',
    version: '114.0.5735.198',
  },
  cpu: { architecture: 'arm' },
  device: { model: '', type: 'desktop', vendor: undefined },
  engine: { name: 'Blink', version: '114.0.5735.198' },
  mobileOS: undefined,
  os: { name: 'Mac OS', version: '13.2.1' },
  sameSiteNoneCompatible: true,
};

export const chromeUserAgent: UserAgent = {
  browser: {
    browserEngine: 'chrome',
    major: '113',
    name: 'chrome',
    version: '113.0.0.0',
  },
  cpu: { architecture: undefined },
  device: { model: undefined, type: undefined, vendor: undefined },
  engine: { name: 'Blink', version: '113.0.0.0' },
  mobileOS: undefined,
  os: { name: 'Mac OS', version: '10.15.7' },
  sameSiteNoneCompatible: true,
};

export const safariUserAgent: UserAgent = {
  browser: {
    browserEngine: 'safari',
    major: '16',
    name: 'safari',
    version: '16.6',
  },
  cpu: { architecture: undefined },
  device: { model: undefined, type: undefined, vendor: undefined },
  engine: { name: 'WebKit', version: '605.1.15' },
  mobileOS: undefined,
  os: { name: 'Mac OS', version: '10.15.7' },
  sameSiteNoneCompatible: true,
};
