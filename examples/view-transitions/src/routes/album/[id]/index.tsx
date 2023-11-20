import type { PageComponent } from '@tramvai/react';
import { useStore } from '@tramvai/state';
import { Link, useRoute, useViewTransition } from '@tramvai/module-router';

import Record from '../../../components/Record';
import TrackList from '../../../components/TrackList';
import PlayButton from '../../../components/PlayButton';
import { AlbumStore, getAlbumByIdAction } from '../../../actions/get-album-by-id.action';

const Album: PageComponent = () => {
  const album = useStore(AlbumStore);
  const { params } = useRoute();

  const currentAlbumId = parseInt(params.id, 10);
  const isNextVisible = currentAlbumId < 8;
  const nextRouteUrl = `/album/${currentAlbumId + 1}`;

  const isTransitioning = useViewTransition(nextRouteUrl);

  if (album === null) {
    return null;
  }

  return (
    <section className={['c-album--container', isTransitioning ? 'transition' : ''].join(' ')}>
      <div className="container mx-auto max-w-screen-lg px-6 lg:px-0 flex flex-col items-start md:items-end md:flex-row pt-8 pb-12 overflow-hidden">
        <Record
          albumId={album.id}
          title={album.name}
          imageUrl={album.img}
          data-todo="client:visible"
        />
        <div className="flex-1 flex flex-col justify-end pt-8">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">{album.name}</h1>
          <p className="mt-3 text-3xl">{album.artist}</p>
          <div className="mt-3 flex">
            <PlayButton
              tracks={album.tracks}
              albumId={album.id}
              artist={album.artist}
              imageUrl={album.img}
            />

            <button
              type="button"
              className="text-pink-600 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-lg px-10 py-3 text-center inline-flex items-center dark:focus:ring-gray-500 mr-4"
            >
              <svg
                className="w-6 h-6 mr-2 -ml-1 text-pink-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Shuffle
            </button>

            {isNextVisible && (
              <button
                type="button"
                className="text-pink-600 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-lg px-10 py-3 text-center inline-flex items-center dark:focus:ring-gray-500 mr-4"
              >
                <Link url={nextRouteUrl} viewTransition>
                  Next
                </Link>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-lg mb-10">
        <TrackList
          tracks={album.tracks}
          albumId={album.id}
          artist={album.artist}
          imageUrl={album.img}
          data-todo="client:visible"
        />
      </div>
    </section>
  );
};

Album.reducers = [AlbumStore];
Album.actions = [getAlbumByIdAction];

export default Album;
