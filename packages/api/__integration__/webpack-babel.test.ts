import { createTestSuite } from './shared/test-suite';

createTestSuite({
  key: 'webpack-babel',
  plugins: ['@tramvai/plugin-webpack-builder', '@tramvai/plugin-babel-transpiler'],
});
