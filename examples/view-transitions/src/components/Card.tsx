import { Link } from '@tramvai/module-router';
import { useViewTransition } from '@tinkoff/router';

import vinylImage from '../assets/vinyl-lp.webp';
import { FIRST_ALBUM_ID } from '../test-ids';

type CardProps = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
};

export function Card({ id, name, artist, imageUrl }: CardProps) {
  const url = `/album/${id}`;
  const isTransitioning = useViewTransition(url);

  return (
    <div className="flex flex-col c-card">
      <Link
        url={url}
        viewTransition
        id={id === '1' ? FIRST_ALBUM_ID : undefined}
        style={isTransitioning ? { viewTransitionName: 'album-expand' } : undefined}
        className="text-black hover:text-pink-500"
      >
        <div className="shadow-md hover:shadow-lg relative">
          <img
            className="card-image rounded-md relative z-10 c-card--album"
            src={imageUrl}
            alt={name}
            width="400"
            height="400"
          />
          <img
            src={vinylImage}
            width="400"
            height="400"
            style={isTransitioning ? { viewTransitionName: 'vinyl-expand' } : undefined}
            className="absolute top-0 opacity-0 vinyl-image c-card--vinyl"
          />
        </div>
        <p className="pt-4 font-semibold">{name}</p>
        <p className="pt-1 text-gray-700">{artist}</p>
      </Link>
    </div>
  );
}
