import path from 'node:path';

import { safeRequireResolve } from './safeRequire';

const expectedResolvePath = path.join(__dirname, 'safeRequire.ts');
const reactPath = require.resolve('react');

describe('safe require/resolve', () => {
  it('should correctly resolve relative path with extension and custom root', () => {
    expect(safeRequireResolve('./safeRequire.ts', __dirname)).toBe(expectedResolvePath);
  });

  it('should correctly resolve relative path without extension and custom root', () => {
    expect(safeRequireResolve('./safeRequire', __dirname)).toBe(expectedResolvePath);
  });

  it('should correctly resolve path without extension and custom root', () => {
    expect(safeRequireResolve('safeRequire', __dirname)).toBe(expectedResolvePath);
  });

  it('should correctly resolve path from node_modules', () => {
    expect(safeRequireResolve('react', __dirname)).toBe(reactPath);
  });

  it('should correctly resolve path from node_modules with specific path', () => {
    expect(safeRequireResolve('react/index', __dirname)).toBe(reactPath);
  });

  it('should correctly resolve path from node_modules with specific path and extension', () => {
    expect(safeRequireResolve('react/index.js', __dirname)).toBe(reactPath);
  });

  it('should throw error when resolve path from node_modules with specific path', () => {
    expect(safeRequireResolve('react/index.ts', __dirname, true)).toBe('');
  });
});
