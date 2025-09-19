export const getMobileOs = (osName?: string): string | undefined => {
  switch (osName) {
    case 'Windows Phone':
      return 'winphone';
    case 'Android':
      return 'android';
    case 'iOS':
      return 'ios';
    case 'BlackBerry':
    case 'RIM Tablet OS':
      return 'blackberry';
  }
};
