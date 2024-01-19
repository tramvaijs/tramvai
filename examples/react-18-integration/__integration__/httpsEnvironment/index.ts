import { createApp } from '@tramvai/core';
import { modules, bundles } from '../../../../test/shared/common';

createApp({
  name: 'react-app',
  modules: [...modules],
  bundles,
});
