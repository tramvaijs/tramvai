import path from 'node:path';
import { create } from 'enhanced-resolve';

const enhancedResolver = create.sync({
  conditionNames: ['browser', 'require', 'node', 'default'],
  mainFields: ['browser', 'module', 'main'],
  extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.json', '.node'],
  alias: {
    apps: path.resolve(__dirname, 'apps'),
    packages: path.resolve(__dirname, 'packages'),
    tools: path.resolve(__dirname, 'tools'),
  },
});

module.exports = enhancedResolver;
