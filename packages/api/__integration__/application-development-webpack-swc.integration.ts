import { createTestSuite } from './shared/application-development.test-suite';

createTestSuite({
  key: 'webpack-swc',
  plugins: [
    '@tramvai/plugin-webpack-builder',
    '@tramvai/plugin-swc-transpiler',
    '@tramvai/plugin-webpack-pwa',
  ],
});
