import path from 'node:path';
import { safeRequireResolve, safeRequire } from './require';

describe('api/utils/require', () => {
  const fixturesRelativePath = './__fixtures__/require';
  const fixturesAbsolutePath = path.join(__dirname, '__fixtures__', 'require');

  it('resolve existed relative path', () => {
    expect(safeRequireResolve(`${fixturesRelativePath}/file`).replace(__dirname, '')).toBe(
      '/__fixtures__/require/file.js'
    );
  });

  it('resolve existed absolute path', () => {
    expect(safeRequireResolve(path.join(fixturesAbsolutePath, 'file')).replace(__dirname, '')).toBe(
      '/__fixtures__/require/file.js'
    );
  });

  it('resolve unexisted path without error', () => {
    expect(safeRequireResolve(`${fixturesRelativePath}/unknown`, true)).toBe('');
  });

  it('require existed relative path', () => {
    expect(safeRequire(`${fixturesRelativePath}/file`)).toEqual({ default: 'file' });
  });

  it('require existed absolute path', () => {
    expect(safeRequire(path.join(fixturesAbsolutePath, 'file'))).toEqual({
      default: 'file',
    });
  });

  it('require unexisted path without error', () => {
    expect(safeRequire(`${fixturesRelativePath}/unknown`, true)).toBe(undefined);
  });
});
