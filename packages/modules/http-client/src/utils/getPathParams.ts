export const getPathParams = (path: string, pattern: string) =>
  path.match(new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^\\/]+)')}$`))?.groups ?? {};
