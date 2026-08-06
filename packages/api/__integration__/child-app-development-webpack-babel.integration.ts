import { createTestSuite } from './shared/child-app-development.test-suite';

createTestSuite({
  key: 'webpack-babel',
  plugins: ['@tramvai/plugin-webpack-builder', '@tramvai/plugin-babel-transpiler'],
});
