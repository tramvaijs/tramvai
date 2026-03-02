// unsafe url symbol, cannot be used in pathname without encoding
const SEPARATOR = '^';

export const getCacheKey = ({ pathname, key }: { pathname: string; key: string }) => {
  return `${pathname}${SEPARATOR}${key}`;
};

export const parseCacheKey = (key: string): [pathname: string, key: string] => {
  return key.split(SEPARATOR) as [pathname: string, key: string];
};
