import { createToken } from '@tinkoff/dippy';
import type { MetaWalk, ListSources, TagRecord } from '@tinkoff/meta-tags-generate';

export const META_DEFAULT_TOKEN =
  createToken<Record<string, string | TagRecord>>('metaDefaultPack');
export const META_WALK_TOKEN = createToken<MetaWalk>('metaWalk');
export const META_UPDATER_TOKEN = createToken<ListSources[number]>('metaUpdater', { multi: true });
