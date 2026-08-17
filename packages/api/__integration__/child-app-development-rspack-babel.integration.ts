import { createTestSuite } from './shared/child-app-development.test-suite';

createTestSuite({
  key: 'rspack-babel',
  plugins: ['@tramvai/plugin-rspack-builder', '@tramvai/plugin-babel-transpiler'],
});
