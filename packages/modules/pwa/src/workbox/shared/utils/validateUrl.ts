export const validateSwScope = (scope: string) => {
  if (!scope.startsWith('/')) {
    throw new Error(`Service Worker scope should start from "/", got ${scope}`);
  }
  if (!scope.endsWith('/')) {
    throw new Error(`Service Worker scope should ends with slash, got ${scope}`);
  }
};

export const validateRelativeUrl = (url: string) => {
  if (!url.startsWith('/')) {
    throw new Error(`Service Worker url should start from "/", got ${url}`);
  }
  if (!url.endsWith('.js')) {
    throw new Error(`Service Worker url should has .js extension, got ${url}`);
  }
};
