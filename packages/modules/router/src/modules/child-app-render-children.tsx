import type { FC } from 'react';
import { Fragment } from 'react';
import type { Container } from '@tinkoff/dippy';
import { CHILD_APP_PAGE_SERVICE_TOKEN } from '@tramvai/tokens-child-app';
import { useRoute } from '@tinkoff/router';

type Props = {
  di: Container;
  [key: string]: any;
};

export const ChildAppRenderChildren: FC<Props> = ({ di, ...props }) => {
  useRoute();

  const childAppPageService = di.get({
    token: CHILD_APP_PAGE_SERVICE_TOKEN,
    optional: true,
  });

  const PageComponent = childAppPageService?.getComponent();

  if (PageComponent) {
    return <PageComponent {...props} />;
  }

  // Only `children` and `key` are allowed as props for Fragment
  return <>{props.children}</>;
};

ChildAppRenderChildren.displayName = 'ChildAppChildren';
