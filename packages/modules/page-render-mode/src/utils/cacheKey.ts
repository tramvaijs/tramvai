export const getCacheKey = ({
  method,
  host,
  path,
  deviceType,
}: {
  method: string;
  host: string;
  path: string;
  deviceType: 'desktop' | 'mobile';
}) => {
  return `${method}=${host}=${path}=${deviceType}`;
};

export const parseCacheKey = (key: string): string[] => {
  return key.split('=');
};
