import path from 'node:path';
import { packageVersion } from './package-version';

describe('api/utils/package-version', () => {
  const fixturesAbsolutePath = path.join(__dirname, '__fixtures__', 'package-version');

  it('should return stub version when development mode', () => {
    expect(
      packageVersion({
        mode: 'development',
        sourceDir: 'root',
        rootDir: fixturesAbsolutePath,
      })
    ).toBe('0.0.0-stub');
  });

  it('should return prerelease version when package.json is not found', () => {
    expect(
      packageVersion({
        mode: 'production',
        sourceDir: 'monorepo',
        rootDir: fixturesAbsolutePath,
      })
    ).toBe('prerelease');
  });

  it('should return package version from source directory package.json', () => {
    expect(
      packageVersion({
        mode: 'production',
        sourceDir: 'first/second',
        rootDir: path.join(fixturesAbsolutePath, 'source'),
      })
    ).toBe('3.0.0');
  });

  it('should return package version from source parent directory package.json', () => {
    expect(
      packageVersion({
        mode: 'production',
        sourceDir: 'first/second',
        rootDir: path.join(fixturesAbsolutePath, 'parent'),
      })
    ).toBe('2.0.0');
  });

  it('should return package version from root directory package.json', () => {
    expect(
      packageVersion({
        mode: 'production',
        sourceDir: 'first/second',
        rootDir: path.join(fixturesAbsolutePath, 'root'),
      })
    ).toBe('1.0.0');
  });
});
