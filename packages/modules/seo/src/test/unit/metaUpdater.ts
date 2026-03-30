import flatten from '@tinkoff/utils/array/flatten';
import { provide } from '@tramvai/core';
import { getDiWrapper } from '@tramvai/test-helpers';
import { Meta, MetaWalk, Render } from '@tinkoff/meta-tags-generate';

import { ApplyMetaProvider } from '../../ApplyMetaProvider';
import { converters } from '../../converters/converters';
import { defaultPack, metaDefaultPack } from '../../metaDefaultPack';
import {
  APPLY_META_TOKEN,
  META_DEFAULT_TOKEN,
  META_UPDATER_TOKEN,
  META_WALK_TOKEN,
} from '../../tokens';
import { transformValue } from '../../transformValue';

type Options = Parameters<typeof getDiWrapper>[0];

export const testMetaUpdater = (options: Options) => {
  const { modules, providers = [] } = options;
  const { di } = getDiWrapper({
    di: options.di,
    modules,
    providers: [
      {
        provide: META_DEFAULT_TOKEN,
        useValue: defaultPack,
      },
      {
        provide: META_UPDATER_TOKEN,
        multi: true,
        useFactory: ({ defaultMeta }) => metaDefaultPack(defaultMeta),
        deps: {
          defaultMeta: META_DEFAULT_TOKEN,
        },
      },
      ...providers,
      provide({
        provide: META_WALK_TOKEN,
        useClass: MetaWalk,
      }),
      ApplyMetaProvider,
    ],
  });

  return {
    di,
    renderMeta: () => {
      const metaWalk = di.get(META_WALK_TOKEN);
      const applyMeta = di.get(APPLY_META_TOKEN);
      const metaUpdaters = di.get({ token: META_UPDATER_TOKEN, multi: true });
      const meta = new Meta({
        list: flatten(metaUpdaters || []),
        transformValue,
        converters,
        metaWalk,
      });
      const renderer = new Render(meta);
      const head = renderer.render({ placement: 'head' });
      const body = renderer.render({ placement: 'body' });

      return {
        head,
        body,
        metaWalk,
        applyMeta,
      };
    },
  };
};
