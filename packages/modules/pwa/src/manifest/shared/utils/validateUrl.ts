export const validateRelativeUrl = (url: string) => {
  if (!url.startsWith('/')) {
    throw new Error(`Webmanifest url should start from "/", got ${url}`);
  }
  if (!(url.endsWith('.json') || url.endsWith('.webmanifest'))) {
    throw new Error(`Webmanifest url should has .json or .webmanifest extension, got ${url}`);
  }
};
