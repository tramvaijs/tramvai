export const KNOWN_VENDORS = new Set([
  'Opera',
  'Google Chrome',
  'Microsoft Edge',
  'Firefox',
  'Safari',
]);

export const KNOWN_ENGINES = new Set(['Chromium']);

export const BACKWARD_COMPATIBILITY_BROWSER_NAME: Record<string, string> = {
  'Google Chrome': 'chrome',
  'Microsoft Edge': 'edge',
};

export const BACKWARD_COMPATIBILITY_ENGINE_NAME: Record<string, string> = {
  Chromium: 'Blink',
};

export const BACKWARD_COMPATIBILITY_ARCH: Record<string, string> = {
  x86: 'amd64',
};

export const BACKWARD_COMPATIBILITY_OS_NAME: Record<string, string> = {
  macOS: 'Mac OS',
};
