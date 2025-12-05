import { useRoute } from '@tramvai/module-router';
import type { PageComponent } from '@tramvai/react';

export const DynamicPage: PageComponent = () => {
  const { params } = useRoute();

  return (
    <div>
      Dynamic Page with parameters: foo: {params.foo} and bar: {params.bar}
    </div>
  );
};

export default DynamicPage;
