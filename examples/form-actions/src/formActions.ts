import { provide } from '@tramvai/core';
import { SERVER_MODULE_PAPI_FORM_ACTIONS } from '@tramvai/tokens-server';
import { createFormAction } from '@tramvai/papi';
import { throwRedirectFoundError } from '@tinkoff/errors';

// Example of form action, registered via DI token
export const formActionProvider = provide({
  provide: SERVER_MODULE_PAPI_FORM_ACTIONS,
  scope: 'singleton',
  multi: true,
  useValue: createFormAction({
    path: '/api/custom-form',
    async handler() {
      throwRedirectFoundError({ nextUrl: '/success', httpStatus: 303 });
    },
  }),
});
