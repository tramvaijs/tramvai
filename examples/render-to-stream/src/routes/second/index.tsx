import { PageComponent } from '@tramvai/react';
import { useUrl } from '@tramvai/module-router';
import { bundleClientOnlyAction, bundleServerOnlyAction } from '../../actions/bundleActions';
import { SecondModal } from '../../components/features/Modal/second';

export const SecondPage: PageComponent = () => {
  // Получаем текущий роут
  const currentPath = useUrl().path;

  return (
    <div>
      Current route is <b>{currentPath}</b>{' '}
    </div>
  );
};

SecondPage.actions = [bundleServerOnlyAction, bundleClientOnlyAction];

SecondPage.components = {
  modal: SecondModal,
};

export default SecondPage;
