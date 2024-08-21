import { declareAction, createBundle } from '@tramvai/core';
import { HttpError } from '@tinkoff/errors';
import { setPageErrorEvent } from '@tramvai/module-router';
import { ErrorPageComponentSSR } from '../components/ErrorPageComponentSSR';
import { ErrorPageComponentClient } from '../components/ErrorPageComponentClient';

const PageComponent = () => {
  return (
    <main>
      <h1>Page Component</h1>
    </main>
  );
};

const DefaultErrorBoundary = () => {
  return (
    <main>
      <h1>Default Error Boundary</h1>
    </main>
  );
};

const PageErrorBoundary = () => {
  return (
    <main>
      <h1>Page Error Boundary</h1>
    </main>
  );
};

const PageActionErrorComponent = () => {
  return (
    <main>
      <h1>Page Action Error Component</h1>
    </main>
  );
};

const NestedLayoutComponent = ({ children }) => {
  return (
    <>
      <nav>Nested Layout</nav>
      {children}
    </>
  );
};

const ErrorNestedLayoutComponent = ({ children }) => {
  throw new Error('Error Nested Layout SSR');
  return (
    <>
      <nav>Nested Layout</nav>
      {children}
    </>
  );
};

const ErrorNestedLayoutComponentForClient = ({ children }) => {
  if (typeof window !== 'undefined') {
    throw new Error('Error Nested Layout SSR');
  }

  return (
    <>
      <nav>Error in Layout on Client</nav>
      {children}
    </>
  );
};

const errorAction = declareAction({
  name: 'errorAction',
  fn() {
    const error = new HttpError({
      httpStatus: 410,
    });
    this.dispatch(setPageErrorEvent(error));
  },
});

PageActionErrorComponent.actions = [errorAction];

const PageGuardErrorComponent = () => {
  return (
    <main>
      <h1>Page Guard Error Component</h1>
    </main>
  );
};

// eslint-disable-next-line import/no-default-export
export default createBundle({
  name: 'mainDefault',
  components: {
    pageComponent: PageComponent,
    errorPageComponent: ErrorPageComponentSSR,
    clientErrorPageComponent: ErrorPageComponentClient,
    errorBoundaryDefault: DefaultErrorBoundary,
    pageErrorBoundaryComponent: PageErrorBoundary,
    pageActionErrorComponent: PageActionErrorComponent,
    pageGuardErrorComponent: PageGuardErrorComponent,
    nestedLayoutComponent: NestedLayoutComponent,
    errorNestedLayoutComponent: ErrorNestedLayoutComponent,
    errorNestedLayoutComponentForClient: ErrorNestedLayoutComponentForClient,
  },
});
