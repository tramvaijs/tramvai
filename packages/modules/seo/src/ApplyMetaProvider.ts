import flatten from '@tinkoff/utils/array/flatten';
import { DI_TOKEN, provide } from '@tramvai/core';
import { MetaWalk } from '@tinkoff/meta-tags-generate';
import { Meta, Update } from '@tinkoff/meta-tags-generate';
import { META_PRIORITY_APP } from './constants';
import { META_UPDATER_TOKEN, APPLY_META_TOKEN, META_WALK_TOKEN } from './tokens';
import { transformValue } from './transformValue';
import { converters } from './converters/converters';
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

      new Update(meta).update();
    };
  },
  deps: {
    di: DI_TOKEN,
  },
});
