/** Compares real path with pattern path
 * @example comparePathWithPattern('/example/mock/12345', '/example/:type/:id') => true
 */
export const comparePathWithPattern = (path: string, pattern: string) =>
  new RegExp(`^${pattern.replace(/:(\w+)/g, '([^\\/]+)')}$`).test(path);
