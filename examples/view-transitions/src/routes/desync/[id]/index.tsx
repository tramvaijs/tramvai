import type { PageComponent } from '@tramvai/react';
import { useStore } from '@tramvai/state';
import { Link, RouterStore, useRoute } from '@tramvai/module-router';

const Counter = ({ title, id }: { title: string; id: string }) => (
  <div
    className="flex-1 rounded-lg p-8 text-white text-center"
    style={{ backgroundColor: `hsl(${(parseInt(id, 10) * 67) % 360} 65% 45%)` }}
  >
    <p className="text-xl font-semibold">{title}</p>
    <p className="text-9xl font-bold">{id}</p>
  </div>
);

// while the leaving page slides out, both counters on it should show the previous id,
// the counter from the router store shows the next one if the store is updated before the snapshot
const Desync: PageComponent = () => {
  const { params } = useRoute();
  const { currentRoute } = useStore(RouterStore);

  const id = parseInt(params.id, 10);

  return (
    <section className="c-desync--container py-8">
      <div className="container mx-auto max-w-screen-lg px-6 lg:px-0">
        <h2 className="font-bold text-3xl text-black tracking-tight mb-4">Router store desync</h2>
        <p className="mb-8 text-gray-700">
          Both counters on the leaving page should keep the previous value during the transition.
        </p>

        <div className="flex gap-6">
          <Counter title="useRoute" id={params.id} />
          <Counter title="RouterStore" id={currentRoute.params.id} />
        </div>

        <div className="mt-8 flex gap-4">
          {id > 1 && (
            <Link
              url={`/desync/${id - 1}`}
              viewTransition
              viewTransitionTypes={['backwards']}
              className="text-pink-600 bg-gray-100 hover:bg-gray-200 rounded-full text-lg px-5 py-3"
            >
              &larr;
            </Link>
          )}
          <Link
            url={`/desync/${id + 1}`}
            viewTransition
            viewTransitionTypes={['forwards']}
            className="text-pink-600 bg-gray-100 hover:bg-gray-200 rounded-full text-lg px-5 py-3"
          >
            &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Desync;
