import { Meta, Update } from '@tinkoff/meta-tags-generate';
import flatten from '@tinkoff/utils/array/flatten';
import { DI_TOKEN, provide } from '@tramvai/core';

import { META_PRIORITY_APP } from './constants';
import { converters } from './converters/converters';
import { META_UPDATER_TOKEN, APPLY_META_TOKEN, META_WALK_TOKEN } from './tokens';
import { transformValue } from './transformValue';
import type { ApplyMeta } from './types';

/** Provider for applying meta tags */
export const ApplyMetaProvider = provide({
  provide: APPLY_META_TOKEN,
  useFactory: ({ di }): ApplyMeta => {
    return function applyMeta({ metaObj } = {}) {
      const metaWalk = di.get(META_WALK_TOKEN);

      if (metaObj) {
        // set the highest priority
        metaWalk.updateMeta(META_PRIORITY_APP, metaObj);
      }

      // We can't use dependencies below as factory provider dependencies
      // due to dependency cycle when using `@tramvai-tinkoff/module-router`.
      const meta = new Meta({
        list: flatten(di.get({ token: META_UPDATER_TOKEN, optional: true, multi: true }) || []),
        metaWalk,
        transformValue,
        converters,
      });

      const updater = new Update(meta);
      updater.update({ placement: 'head' });
      updater.update({ placement: 'body' });
    };
  },
  deps: {
    di: DI_TOKEN,
  },
});
