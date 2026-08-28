import { createTestSuite } from './shared/child-app-development.test-suite';

createTestSuite({
  key: 'rspack-swc',
  plugins: ['@tramvai/plugin-rspack-builder', '@tramvai/plugin-swc-transpiler'],
});
