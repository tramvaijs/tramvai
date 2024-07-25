import { createChildApp } from '@tramvai/child-app-core';
import { ROUTES_TOKEN, RouterChildAppModule } from '@tramvai/module-router';
import { provide } from '@tinkoff/dippy';
import { HeaderCmp } from './component';

// support old Child Apps versions for integration tests matrix
const { CHILD_REQUIRED_CONTRACTS } = require('@tramvai/child-app-core');

declare module '@tramvai/module-child-app' {
  export interface TypedContractsRequired {
    ROUTES_TOKEN: typeof ROUTES_TOKEN;
  }
}

// eslint-disable-next-line import/no-default-export
export default createChildApp({
  name: 'header',
  render: HeaderCmp,
  modules: [RouterChildAppModule],
  providers: CHILD_REQUIRED_CONTRACTS
    ? [
        provide({
          provide: CHILD_REQUIRED_CONTRACTS,
          // required when CA used in 2.0.0 tramvai host app
          multi: true,
          useValue: [ROUTES_TOKEN],
        }),
      ]
    : [],
});
