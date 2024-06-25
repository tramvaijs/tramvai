import { provide } from '@tinkoff/dippy';
import { createChildApp } from '@tramvai/child-app-core';
import { CommonChildAppModule } from '@tramvai/module-common';
import { ReactQueryModule } from '@tramvai/module-react-query';
import { Cmp } from './component';
import { query } from './query';
import { FAKE_API_CLIENT } from '../../shared/tokens';

// support old Child Apps versions for integration tests matrix
const { CHILD_REQUIRED_CONTRACTS } = require('@tramvai/child-app-core');

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'react-query',
  render: Cmp,
  modules: [CommonChildAppModule, ReactQueryModule],
  actions: [query.prefetchAction()],
  providers: CHILD_REQUIRED_CONTRACTS
    ? [
        provide({
          provide: CHILD_REQUIRED_CONTRACTS,
          // required when CA used in 2.0.0 tramvai host app
          multi: true,
          useValue: [FAKE_API_CLIENT],
        }),
      ]
    : [],
});
