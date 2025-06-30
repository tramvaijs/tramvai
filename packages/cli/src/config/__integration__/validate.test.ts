import path from 'node:path';
import { validate } from '../validate';
import { ApplicationConfigEntry, ConfigManager } from '../../api';

const rootDir = path.resolve(__dirname, './__fixtures__/relative');
const baseConfigManager = {
  type: 'application',
  root: 'src',
  buildType: 'client',
  rootDir,
} as ConfigManager<ApplicationConfigEntry>;

describe('validate config', () => {
  it('should correctly resolve polyfill entry with path', () => {
    const config = {
      ...baseConfigManager,
      polyfill: 'src/polyfill.ts',
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should correctly resolve polyfill entry with relative path', () => {
    const config = {
      ...baseConfigManager,
      polyfill: './src/polyfill.ts',
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should correctly resolve polyfill entry with relative path without extension', () => {
    const config = {
      ...baseConfigManager,
      polyfill: './src/polyfill',
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should correctly resolve polyfill entry with absolute path', () => {
    const config = {
      ...baseConfigManager,
      polyfill: path.join(rootDir, './src/polyfill'),
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should throw error when resolve non-existent polyfill entry with relative path', () => {
    const config = {
      ...baseConfigManager,
      polyfill: './src/polyfil',
    };

    expect(() => validate(config)).toThrow();
  });

  it('should correctly resolve polyfill entry from node_modules', () => {
    const config = {
      ...baseConfigManager,
      polyfill: 'react',
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should correctly resolve polyfill entry from node_modules with specific file path', () => {
    const config = {
      ...baseConfigManager,
      polyfill: 'react/index',
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should correctly resolve polyfill entry from node_modules with specific file path and extension', () => {
    const config = {
      ...baseConfigManager,
      polyfill: 'react/index.js',
    };

    expect(validate(config)).toBeUndefined();
  });

  it('should throw error when resolve polyfill entry from node_modules with non-existent path', () => {
    const config = {
      ...baseConfigManager,
      polyfill: 'react/index.ts',
    };

    expect(() => validate(config)).toThrow();
  });
});
