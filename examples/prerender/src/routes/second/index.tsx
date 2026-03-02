import type { PageComponent } from '@tramvai/react';

export const SecondPage: PageComponent = () => {
  return <div>Second Page</div>;
};

SecondPage.renderMode = 'static';

export default SecondPage;
