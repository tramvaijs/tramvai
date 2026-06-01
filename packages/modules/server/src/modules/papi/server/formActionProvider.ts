import { Scope, type Provider } from '@tramvai/core';
import { LOGGER_TOKEN } from '@tramvai/tokens-common';
import { SERVER_MODULE_PAPI_FORM_ACTIONS } from '@tramvai/tokens-server';
import { createPapiMethod, getPapiParameters, isPapiMethod } from '@tramvai/papi';
import { Papi } from '@tramvai/papi';
import { getAllFileSystemFormActions, staticFileSystemPageToPath } from '@tramvai/experiments';

const getFormActionPapi = ({ logger }: { logger: typeof LOGGER_TOKEN }) => {
  const log = logger('papi:formAction');
  const result: Papi[] = [];
  const formActions = getAllFileSystemFormActions();

  Object.entries(formActions).forEach(([key, action]) => {
    if (!isPapiMethod(action)) {
      log.error({
        key,
        action,
        message: `Form action is not a valid PAPI method.`,
      });

      throw new Error('Not a PAPI');
    }

    const papiParameters = getPapiParameters(action);

    result.push(
      createPapiMethod({
        ...papiParameters,
        path: staticFileSystemPageToPath(key),
      })
    );
  });

  return result;
};

export const formActionProvider: Provider = {
  provide: SERVER_MODULE_PAPI_FORM_ACTIONS,
  scope: Scope.SINGLETON,
  multi: true,
  useFactory: getFormActionPapi,
  deps: {
    logger: LOGGER_TOKEN,
  },
};
