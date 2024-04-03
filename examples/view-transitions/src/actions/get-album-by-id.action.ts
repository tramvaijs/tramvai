import { declareAction } from '@tramvai/core';
import { createEvent, createReducer } from '@tramvai/state';

import { ROUTER_TOKEN } from '@tramvai/tokens-router';
import type { AlbumWithTracks } from '../types';

export const albumLoaded = createEvent<AlbumWithTracks>('album loaded');

export const AlbumStore = createReducer<AlbumWithTracks | null>('album', null).on(
  albumLoaded,
  (state, payload) => payload
);

export const getAlbumByIdAction = declareAction({
  name: 'get-album-by-id',
  async fn() {
    const { params } = this.deps.router.getCurrentRoute();

    if (params.id !== undefined) {
      const { default: album } = await import(`./data/album-${params.id}.json`);

      this.dispatch(albumLoaded(album));
    }
  },
  deps: {
    router: ROUTER_TOKEN,
  },
  conditions: {
    dynamic: true,
  },
});
