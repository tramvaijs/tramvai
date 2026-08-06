import { createTestSuite } from './shared/child-app-development.test-suite';

createTestSuite({
  key: 'webpack-swc',
  plugins: ['@tramvai/plugin-webpack-builder', '@tramvai/plugin-swc-transpiler'],
});
