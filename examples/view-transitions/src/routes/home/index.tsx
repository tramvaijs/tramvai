import { useStore } from '@tramvai/state';
import type { PageComponent } from '@tramvai/react';

import { Card } from '../../components/Card';
import { AlbumsStore, getAlbumsAction } from '../../actions/get-albums.action';

const Home: PageComponent = () => {
  const albums = useStore(AlbumsStore);

  return (
    <section className="py-8">
      <div className="container mx-auto max-w-screen-lg px-6 lg:px-0 flex items-center flex-wrap pt-4 pb-12">
        <h2 className="font-bold text-3xl text-black tracking-tight mb-12">Recently Played</h2>

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Card
              key={album.id}
              id={album.id}
              name={album.name}
              artist={album.artist}
              imageUrl={album.img}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

Home.reducers = [AlbumsStore];
Home.actions = [getAlbumsAction];

export default Home;
