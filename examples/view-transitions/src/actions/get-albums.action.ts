import { declareAction } from '@tramvai/core';
import { createEvent, createReducer } from '@tramvai/state';

import type { Album } from '../types';

import albums from './data/albums.json';

export const albumsLoaded = createEvent<Album[]>('albums loaded');

export const AlbumsStore = createReducer<Album[]>('albums', []).on(
  albumsLoaded,
  (state, payload) => payload
);

export const getAlbumsAction = declareAction({
  name: 'get-albums',
  async fn() {
    this.dispatch(albumsLoaded(albums));
  },
  conditions: {
    dynamic: true,
  },
});
