export const ClientHintsHeaders = {
  BASE: 'sec-ch-ua',
  FULL_VERSION_LIST: 'sec-ch-ua-full-version-list',
  PLATFORM: 'sec-ch-ua-platform',
  PLATFORM_VERSION: 'sec-ch-ua-platform-version',
  ARCH: 'sec-ch-ua-arch',
  MODEL: 'sec-ch-ua-model',
  MOBILE: 'sec-ch-ua-mobile',
} as const;

export type ClientHintsHeaders = (typeof ClientHintsHeaders)[keyof typeof ClientHintsHeaders];
