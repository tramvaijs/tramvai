import type { PageComponent } from '@tramvai/react';

export const SsrErrorPage: PageComponent = () => {
  throw new Error('SSR fatal error');
};
