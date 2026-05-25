import { createApp } from '@tramvai/core';
import { modules, bundles } from '@tramvai/internal-test-utils/shared/common';
import { PerformanceProfileModule } from '@tramvai/module-performance-profile';

createApp({
  name: 'performance-profile',
  modules: [PerformanceProfileModule, ...modules],
  providers: [],
  bundles,
});
