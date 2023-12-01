export const normalizeSwUrl = (url: string, scope: string) => {
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  const normalizedScope = scope.replace(/\/$/, '');
  const result = `${normalizedScope}${normalizedUrl}`;

  return result;
};
