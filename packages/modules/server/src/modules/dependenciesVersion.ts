import { resolve } from 'path';
import { Module } from '@tramvai/core';
import { createPapiMethod } from '@tramvai/papi';
import {
  SERVER_MODULE_PAPI_PRIVATE_ROUTE,
  DEPENDENCIES_VERSION_FILTER_TOKEN,
} from '@tramvai/tokens-server';
import { safeNodeRequire } from './utils/require';
import { tramvaiDepsFilter } from './utils/tramvaiDepsFilter';

let packageJson: Record<string, any> = {};

try {
  // eslint-disable-next-line import/no-unresolved
  packageJson = require('../../../../package.json');
} catch (e) {
  packageJson = safeNodeRequire(resolve(process.cwd(), 'package.json'));
}

@Module({
  providers: [
    {
      provide: SERVER_MODULE_PAPI_PRIVATE_ROUTE,
      multi: true,
      useFactory: () => {
        const { dependencies = [] } = packageJson ?? {};
        return createPapiMethod({
          path: '/dependenciesVersion',
          method: 'get',
          async handler() {
            return this.deps.depsFilter(dependencies);
          },
          deps: {
            depsFilter: DEPENDENCIES_VERSION_FILTER_TOKEN,
          },
        });
      },
    },
    {
      provide: DEPENDENCIES_VERSION_FILTER_TOKEN,
      useValue: tramvaiDepsFilter,
    },
  ],
})
export class DependenciesVersionModule {}
