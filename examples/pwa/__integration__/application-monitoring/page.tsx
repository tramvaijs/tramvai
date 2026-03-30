import type { PageComponent } from '@tramvai/react';
import { useEffect, useState } from 'react';
import { useUrl } from '@tramvai/module-router';

export const MainPage: PageComponent = () => {
  const [isCaughtError, setCaughtError] = useState(false);

  const { query } = useUrl();
  if (query.error === 'true' && typeof window !== 'undefined') {
    throw new Error('this error was thrown during hydration');
  }

  useEffect(() => {
    if (isCaughtError) {
      throw new Error('This error expected to be caught');
    }
  }, [isCaughtError]);

  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <button
      role="button"
      type="button"
      onClick={() => {
        setCaughtError(true);
      }}
    >
      Trigger an error
    </button>
  );
};

// eslint-disable-next-line import/no-default-export
export default MainPage;
