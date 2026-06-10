import { createTestSuite } from './shared/application-development.test-suite';

createTestSuite({
  key: 'rspack-swc',
  plugins: [
    '@tramvai/plugin-rspack-builder',
    '@tramvai/plugin-swc-transpiler',
    '@tramvai/plugin-webpack-pwa',
  ],
});
