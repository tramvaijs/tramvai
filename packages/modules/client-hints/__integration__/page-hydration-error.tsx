import { useMedia } from '@tramvai/module-client-hints';
import { Link } from '@tramvai/module-router';
import { Suspense } from 'react';

const HeavyComponent = () => {
  const data = [];

  for (let i = 0; i <= 1000; i++) {
    data.push(i);
  }

  return (
    <ul>
      {data.map((item) => {
        return (
          <li key={item}>
            <Link url="/">{item}</Link>
          </li>
        );
      })}
    </ul>
  );
};

export const PageHydrationError = () => {
  useMedia();

  return (
    <>
      <div>pageHydrationError</div>

      <Suspense>
        <HeavyComponent />
      </Suspense>
    </>
  );
};

export default PageHydrationError;
