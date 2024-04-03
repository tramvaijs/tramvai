import { Fragment } from 'react';
import type { Container } from '@tinkoff/dippy';
import { CHILD_APP_PAGE_SERVICE_TOKEN } from '@tramvai/tokens-child-app';
import { useRoute } from '@tinkoff/router';

export const ChildAppRenderChildren = ({ di }: { di: Container }) => {
  useRoute();

  const childAppPageService = di.get({
    token: CHILD_APP_PAGE_SERVICE_TOKEN,
    optional: true,
  });

  const PageComponent = childAppPageService?.getComponent() || Fragment;

  return <PageComponent />;
};
