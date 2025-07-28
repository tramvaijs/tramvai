import { createTestSuite } from './shared/test-suite';

createTestSuite({
  key: 'webpack-swc',
  plugins: ['@tramvai/plugin-webpack-builder', '@tramvai/plugin-swc-transpiler'],
});
