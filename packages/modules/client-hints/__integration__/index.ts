import { createApp } from '@tramvai/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ClientHintsCSRModule } from '@tramvai/module-client-hints';
import { modules, bundles } from '../../../../test/shared/common';

createApp({
  name: 'client-hints',
  modules: [...modules, ClientHintsCSRModule],
  bundles,
});
