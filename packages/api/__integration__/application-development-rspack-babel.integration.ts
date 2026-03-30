import { createTestSuite } from './shared/application-development.test-suite';

createTestSuite({
  key: 'rspack-babel',
  plugins: [
    '@tramvai/plugin-rspack-builder',
    '@tramvai/plugin-babel-transpiler',
    // '@tramvai/plugin-webpack-pwa',
  ],
});
