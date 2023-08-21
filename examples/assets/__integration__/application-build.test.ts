import path from 'path';
import fs from 'fs';
import { build } from '@tramvai/cli';

jest.setTimeout(30000);

describe('assets build', () => {
  beforeAll(async () => {
    await build({
      rootDir: path.resolve(__dirname, '../'),
      target: 'assets',
    });
  }, 80000);

  it('optimized svg snapshot', async () => {
    const distClientDirectory = path.resolve(__dirname, '../dist', 'client');
    const svgFilenames = [
      'bd514a4fdeae248aabd3844c43fa2cc1.svg',
      'bf9fb7baf3f9985e84328ccf5eeef509.svg',
    ];

    svgFilenames.forEach((filename) => {
      const file = fs.readFileSync(path.join(distClientDirectory, filename), 'utf-8');

      expect(file).toMatchSnapshot();
    });
  });
});
