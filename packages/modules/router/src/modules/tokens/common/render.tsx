import type { AbstractRouter, RouterState } from '@tinkoff/router';
import { Provider } from '@tinkoff/router';

export const provideRouter = ({ router }: { router: AbstractRouter }) => {
  const serverState: RouterState = {
    route: router.getCurrentRoute(),
    url: router.getCurrentUrl(),
  };

  return (render) => {
    return (
      <Provider router={router} serverState={serverState}>
        {render}
      </Provider>
    );
  };
};
