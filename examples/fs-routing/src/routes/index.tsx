import { useActions } from '@tramvai/state';
import type { PageComponent } from '@tramvai/react';
import { Button } from '../components/shared/Button/Button';
import { navigateAction } from '../actions/navigateAction';
import { bundleClientOnlyAction, bundleServerOnlyAction } from '../actions/bundleActions';
import { MainModal } from '../components/features/Modal/main';

export const MainPage: PageComponent = () => {
  // Привязываем экшен для навигации к стору
  const navigate = useActions(navigateAction);

  return (
    <div>
      Main Page
      <Button onClick={() => navigate('/second/')}>to second page</Button>
      <Button onClick={() => navigate('/old/')}>to old page</Button>
      <Button onClick={() => navigate('/third/')}>to error page</Button>
    </div>
  );
};

MainPage.actions = [bundleServerOnlyAction, bundleClientOnlyAction];

MainPage.components = {
  modal: MainModal,
};

MainPage.seo = {
  metaTags: {
    title: 'Main Page Title',
  },
};

export default MainPage;
