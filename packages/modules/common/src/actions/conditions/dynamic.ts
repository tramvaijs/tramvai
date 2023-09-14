import type { ActionCondition } from '@tramvai/tokens-common';
import { isBrowser, isServer } from './helpers';

// @todo make this behaviour default in next tramvai major version?
export const dynamicCondition: ActionCondition = {
  key: 'dynamicCondition',
  fn: (checker) => {
    if (checker.conditions.dynamic) {
      if (isServer) {
        checker.setState({ environment: 'server' });
      }

      if (!checker.getState() || checker.getState().environment === 'browser') {
        checker.allow();
      }

      if (isBrowser) {
        checker.setState({ environment: 'browser' });
      }
    }
  },
};
