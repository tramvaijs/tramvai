import { createChildApp } from '@tramvai/child-app-core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { RouterChildAppModule } from '@tramvai/module-router';
import { DeferredStateCmp } from './component';
import { deferredChildAction } from './actions';

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'deferred',
  render: DeferredStateCmp,
  modules: [CommonChildAppModule, RouterChildAppModule],
  actions: [deferredChildAction],
  providers: [],
});
